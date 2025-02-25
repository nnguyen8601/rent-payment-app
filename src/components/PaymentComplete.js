import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import '../styles/PaymentComplete.css';

const PaymentComplete = () => {
    const stripe = useStripe();
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: 'processing', message: 'Processing your payment...' });
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        // Extract the payment intent client secret from the URL
        const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

        if (!clientSecret) {
            setStatus({
                type: 'error',
                message: 'No payment information found. Please try again.'
            });
            return;
        }

        // Retrieve payment intent details
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            console.log('Payment intent details:', paymentIntent);
            console.log('Full payment intent:', JSON.stringify(paymentIntent));
            
            // Update payment status in the database using the original working function
            fetch('/api/update-payment-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status,
                    // Add any other fields expected by the original function
                    amount: paymentIntent.amount / 100
                }),
            })
            .then(response => response.text())
            .then(text => {
                try {
                    const data = JSON.parse(text);
                    console.log('Payment status update response:', data);
                } catch (e) {
                    console.log('Raw update response:', text);
                }
            })
            .catch(err => {
                console.error('Error updating payment status:', err);
            });

            // Set the UI based on the payment status
            switch (paymentIntent.status) {
                case "succeeded":
                    setStatus({ 
                        type: 'success', 
                        message: 'Payment successful! Thank you for your payment.' 
                    });
                    setPaymentDetails({
                        amount: (paymentIntent.amount / 100).toFixed(2),
                        date: new Date().toLocaleDateString(),
                        id: paymentIntent.id
                    });
                    break;
                case "processing":
                    setStatus({ 
                        type: 'processing', 
                        message: 'Your payment is processing.' 
                    });
                    break;
                case "requires_payment_method":
                    setStatus({ 
                        type: 'error', 
                        message: 'Your payment was not successful. Please try again.' 
                    });
                    break;
                default:
                    setStatus({ 
                        type: 'error', 
                        message: 'Something went wrong with your payment.' 
                    });
                    break;
            }

            // Get user email
            const getUserEmail = async () => {
                try {
                    const authResponse = await fetch('/.auth/me');
                    const authData = await authResponse.json();
                    
                    if (!authData.clientPrincipal) {
                        console.error('Not authenticated');
                        return null;
                    }
                    
                    const emailClaim = authData.clientPrincipal.claims.find(
                        claim => claim.typ === 'emails'
                    );
                    
                    return emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
                } catch (err) {
                    console.error('Error getting user email:', err);
                    return null;
                }
            };

            const email = await getUserEmail();
            console.log('User email for direct update:', email);

            if (email) {
                // Call direct payment update as a fallback
                fetch('/api/direct-payment-update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        email: email
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Direct payment update response:', data);
                })
                .catch(err => {
                    console.error('Error in direct payment update:', err);
                });
            }
        });
    }, [stripe]);

    return (
        <div className="payment-complete" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Payment Status</h1>
            
            <div style={{ 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: 
                    status.type === 'success' ? '#d4edda' : 
                    status.type === 'error' ? '#f8d7da' : '#cce5ff',
                color: 
                    status.type === 'success' ? '#155724' : 
                    status.type === 'error' ? '#721c24' : '#004085',
                marginBottom: '20px'
            }}>
                <p style={{ fontSize: '18px' }}>{status.message}</p>
            </div>
            
            {paymentDetails && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Payment Details</h2>
                    <p><strong>Amount:</strong> ${paymentDetails.amount}</p>
                    <p><strong>Date:</strong> {paymentDetails.date}</p>
                    <p><strong>Transaction ID:</strong> {paymentDetails.id}</p>
                </div>
            )}
            
            <button
                onClick={() => navigate('/')}
                style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Return to Account
            </button>
        </div>
    );
};

export default PaymentComplete; 