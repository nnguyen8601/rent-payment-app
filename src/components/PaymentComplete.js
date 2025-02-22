import React, { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import '../styles/PaymentComplete.css';

const PaymentComplete = () => {
    const stripe = useStripe();
    const [paymentStatus, setPaymentStatus] = useState({
        status: 'processing',
        message: 'Processing your payment...'
    });

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            'payment_intent_client_secret'
        );

        if (!clientSecret) {
            setPaymentStatus({
                status: 'error',
                message: 'No payment information found.'
            });
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(async ({ paymentIntent }) => {
            // First update the UI
            switch (paymentIntent.status) {
                case 'succeeded':
                    // First update the database status
                    try {
                        const statusResponse = await fetch('/api/update-payment-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                paymentIntentId: paymentIntent.id,
                                status: 'succeeded' // Explicitly set status to succeeded
                            })
                        });

                        if (!statusResponse.ok) {
                            console.error('Failed to update payment status:', await statusResponse.text());
                        }

                        // Then update UI
                        setPaymentStatus({
                            status: 'success',
                            message: 'Payment successful! Thank you for your payment.',
                            amount: (paymentIntent.amount / 100).toFixed(2),
                            date: new Date(paymentIntent.created * 1000).toLocaleDateString()
                        });
                    } catch (error) {
                        console.error('Failed to update payment status:', error);
                    }
                    break;

                case 'processing':
                    setPaymentStatus({
                        status: 'processing',
                        message: 'Your payment is processing.'
                    });
                    break;

                case 'requires_payment_method':
                    setPaymentStatus({
                        status: 'error',
                        message: 'Your payment was not successful, please try again.'
                    });
                    break;

                default:
                    setPaymentStatus({
                        status: 'error',
                        message: 'Something went wrong.'
                    });
                    break;
            }
        });
    }, [stripe]);

    return (
        <div className="payment-complete-container">
            <div className={`payment-status ${paymentStatus.status}`}>
                <h2>Payment Status</h2>
                <div className="status-message">
                    {paymentStatus.message}
                </div>
                {paymentStatus.status === 'success' && (
                    <div className="payment-details">
                        <p>Amount paid: ${paymentStatus.amount}</p>
                        <p>Date: {paymentStatus.date}</p>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="return-button"
                        >
                            Return to Payment Form
                        </button>
                    </div>
                )}
                {paymentStatus.status === 'error' && (
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="return-button"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentComplete; 