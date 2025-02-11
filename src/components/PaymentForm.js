// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/PaymentForm.css';

const PaymentForm = () => {
    // Add rental properties data
    const rentalProperties = [
        { id: 1, address: '123 Main St, Chicago, IL 60610' },
        { id: 2, address: '456 Park Ave, Chicago, IL 60602' },
        { id: 3, address: '789 Lake St, Chicago, IL 60603' },
        { id: 4, address: '321 State St, Chicago, IL 60604' },
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
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: formData.amount,
                    renterName: formData.renterName,
                    rentLocation: formData.rentLocation,
                    zipCode: formData.zipCode
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
                color: '#424770',
                fontFamily: 'Arial, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
                padding: '10px 12px',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true,
        classes: {
            base: 'stripe-element',
            complete: 'stripe-element--complete',
            empty: 'stripe-element--empty',
            focus: 'stripe-element--focus',
            invalid: 'stripe-element--invalid',
            webkitAutofill: 'stripe-element--webkit-autofill'
        },
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
                            className="card-element"
                            onChange={(e) => {
                                console.log('Card Element change:', e);
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