// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import '../styles/PaymentForm.css';

const PaymentForm = () => {
    // Rental properties data
    const rentalProperties = [
        { id: 1, address: 'CILA 1' },
        { id: 2, address: 'CILA 2' },
        { id: 3, address: 'CILA 3' },
        { id: 4, address: 'CILA 4' },
        { id: 5, address: 'CILA 5' },
        { id: 6, address: 'CILA 6' },
        { id: 7, address: 'CILA 7' },
        { id: 8, address: 'CILA 9' }
        // Add more properties as needed
    ];

    // Get Stripe hooks
    const stripe = useStripe();
    const elements = useElements();

    // Form state
    const [formData, setFormData] = useState({
        renterName: '',
        rentLocation: '',
        amount: '',
        zipCode: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setPaymentStatus(null);

        try {
            // First, create payment intent and get clientSecret
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: formData.amount,
                    renterName: formData.renterName,
                    rentLocation: formData.rentLocation,
                    zipCode: formData.zipCode
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Submit the form before confirming payment
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }

            // Use the clientSecret to confirm payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret: data.clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-complete`,
                    payment_method_data: {
                        billing_details: {
                            name: formData.renterName
                        }
                    }
                },
                redirect: 'if_required'
            });

            if (error) {
                throw new Error(error.message);
            }

            if (paymentIntent.status === 'succeeded') {
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

    return (
        <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
                {/* Renter details */}
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

                {/* Property selection */}
                <div className="form-group">
                    <label htmlFor="rentLocation">Rental Property</label>
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

                {/* Amount */}
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

                {/* Stripe Payment Element */}
                <div className="form-group">
                    <label>Payment Details</label>
                    <PaymentElement />
                </div>

                {/* Status message */}
                {paymentStatus && (
                    <div className={`status-message ${paymentStatus.type}`}>
                        {paymentStatus.message}
                    </div>
                )}

                {/* Submit button */}
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