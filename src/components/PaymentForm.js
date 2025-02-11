// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/PaymentForm.css';

const PaymentForm = ({ user }) => {
    // Add rental properties data
    const rentalProperties = [
        { id: 1, address: 'CILA 1' },
        { id: 2, address: 'CILA 2' },
        { id: 3, address: 'CILA 3' },
        { id: 4, address: 'CILA 4' },
        { id: 5, address: 'CILA 5' },
        { id: 6, address: 'CILA 6' },
        { id: 7, address: 'CILA 7' },
        { id: 8, address: 'CILA 8' }
        // Add more properties as needed
    ];

    const stripe = useStripe();
    const elements = useElements();

    // Add this for debugging
    useEffect(() => {
        console.log('Stripe available:', !!stripe);
        console.log('Elements available:', !!elements);
    }, [stripe, elements]);

    const [formData, setFormData] = useState({
        renterName: '',
        rentLocation: '',
        amount: '',
        zipCode: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setPaymentStatus(null);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: formData.renterName,
                    address: {
                        postal_code: formData.zipCode
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: formData.amount,
                    renterName: formData.renterName,
                    rentLocation: formData.rentLocation,
                    zipCode: formData.zipCode,
                    userId: user.id
                })
            });

            const result = await response.json();

            if (result.success) {
                setPaymentStatus({
                    type: 'success',
                    message: 'Payment processed successfully!'
                });
                // Clear form
                setFormData({
                    renterName: '',
                    rentLocation: '',
                    amount: '',
                    zipCode: '',
                });
                elements.getElement(CardElement).clear();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setPaymentStatus({
                type: 'error',
                message: `Payment failed: ${error.message}`
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    };

    return (
        <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="renterName">Renter's Name</label>
                    <input
                        type="text"
                        id="renterName"
                        name="renterName"
                        value={formData.renterName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="rentLocation">Rental Property Address</label>
                    <select
                        id="rentLocation"
                        name="rentLocation"
                        value={formData.rentLocation}
                        onChange={handleChange}
                        required
                        className="select-input"
                    >
                        <option value="">Select a property</option>
                        {rentalProperties.map(property => (
                            <option key={property.id} value={property.address}>
                                {property.address}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Payment Amount ($)</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Card Details</label>
                    <div className="card-element-container">
                        <CardElement 
                            options={cardElementOptions}
                            onChange={e => {
                                console.log('CardElement change:', e.complete, e.error);
                            }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="zipCode">Billing Zip Code</label>
                    <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        maxLength="5"
                        required
                    />
                </div>

                {paymentStatus && (
                    <div className={`status-message ${paymentStatus.type}`}>
                        {paymentStatus.message}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isProcessing || !stripe}
                >
                    {isProcessing ? 'Processing...' : 'Submit Payment'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;