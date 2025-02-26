import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { colors, containerStyles, spacing } from '../styles/shared';
import Loading from './shared/Loading';

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
            
            // First get the user's email and tenant ID
            const getUserData = async () => {
                try {
                    const authResponse = await fetch('/.auth/me');
                    const authData = await authResponse.json();
                    
                    if (!authData.clientPrincipal) {
                        throw new Error('Not authenticated');
                    }
                    
                    const emailClaim = authData.clientPrincipal.claims.find(
                        claim => claim.typ === 'emails'
                    );
                    
                    const email = emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
                    
                    // Get tenant data using the email
                    const userDataResponse = await fetch(`/api/get-user-data?email=${encodeURIComponent(email)}`);
                    if (!userDataResponse.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    
                    const userData = await userDataResponse.json();
                    console.log('User data retrieved:', userData);
                    return userData;
                } catch (err) {
                    console.error('Error getting user data:', err);
                    return null;
                }
            };

            // Get user data and then update payment status
            getUserData().then(userData => {
                if (!userData) {
                    console.error('Could not get user data for payment update');
                    return;
                }
                console.log('About to update payment status with userData:', userData);

                // Now we have the tenant ID, update payment status
                fetch('/api/update-payment-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount / 100,
                        tenantId: userData.tenantId  // Make sure this exists
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
                            id: paymentIntent.id,
                            property: userData.propertyName
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
            });
        });
    }, [stripe]);

    if (!stripe) return <Loading message="Initializing payment system..." />;

    return (
        <div className="page-container fade-in">
            <div style={containerStyles}>
                <h1 style={{ color: colors.dark, marginBottom: spacing.xl }}>
                    Payment Status
                </h1>

                <div className="card" style={{
                    backgroundColor: 
                        status.type === 'success' ? '#f8fff8' :
                        status.type === 'error' ? '#fff8f8' : '#f8f9fa'
                }}>
                    <div style={{ 
                        color: 
                            status.type === 'success' ? colors.success :
                            status.type === 'error' ? colors.danger : colors.primary,
                        textAlign: 'center',
                        marginBottom: spacing.lg
                    }}>
                        <p style={{ fontSize: '18px' }}>{status.message}</p>
                    </div>

                    {paymentDetails && (
                        <div style={{ marginTop: spacing.lg }}>
                            <h2 style={{ color: colors.gray, marginBottom: spacing.md }}>
                                Payment Details
                            </h2>
                            <p><strong>Amount:</strong> ${paymentDetails.amount}</p>
                            <p><strong>Date:</strong> {paymentDetails.date}</p>
                            <p><strong>Transaction ID:</strong> {paymentDetails.id}</p>
                            <p><strong>Property:</strong> {paymentDetails.property}</p>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: spacing.xl }}
                    >
                        Return to Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentComplete; 