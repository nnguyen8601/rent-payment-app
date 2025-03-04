// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { colors, containerStyles, spacing } from '../styles/shared';
import Loading from './shared/Loading';
import Error from './shared/Error';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    
    const [userData, setUserData] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function loadUserData() {
            try {
                // Get auth data from B2C
                const authResponse = await fetch('/.auth/me');
                const authData = await authResponse.json();
                
                if (!authData.clientPrincipal) {
                    throw new Error('Not authenticated');
                }

                // Extract email from claims
                const emailClaim = authData.clientPrincipal.claims.find(
                    claim => claim.typ === 'emails' || 
                           claim.typ === 'email' || 
                           claim.typ.includes('emailaddress')
                );
                
                const email = emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
                
                // Get user data
                const response = await fetch(`/api/get-user-data?email=${encodeURIComponent(email)}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                
                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        loadUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements || processing) {
            return;
        }
        
        setProcessing(true);
        setError(null);
        
        try {
            // Use the original ProcessPayment endpoint that was working before
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    renterName: `${userData.firstName} ${userData.lastName}`,
                    rentLocation: userData.propertyName,
                    // Add any other fields expected by the original function
                    zipCode: '' // Add this if needed by the original function
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment processing failed');
            }
            
            const data = await response.json();
            console.log('Payment intent created:', data);
            
            // Handle Stripe Elements submission
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }
            
            // Confirm the payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-complete`,
                },
                clientSecret: data.clientSecret,
            });
            
            if (error) {
                throw new Error(error.message);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            setProcessing(false);
        }
    };
    
    if (loading) return <Loading message="Loading payment information..." />;
    if (error) return <Error message={error} />;
    if (!userData) return null;

    return (
        <div className="page-container fade-in">
            <div style={containerStyles}>
                <h1 style={{ color: colors.dark, marginBottom: spacing.xl }}>
                    Make a Payment
                </h1>

                <div className="card" style={{ marginBottom: spacing.lg }}>
                    <h2 style={{ color: colors.gray, marginBottom: spacing.md }}>
                        Account Information
                    </h2>
                    <div style={{ marginBottom: spacing.md }}>
                        <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Property:</strong> {userData.propertyName}</p>
                    </div>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ color: colors.dark }}>Payment Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="1"
                                step="0.01"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ color: colors.dark }}>Payment Details</label>
                            <PaymentElement />
                        </div>

                        <button 
                            type="submit"
                            disabled={!stripe || processing || !amount}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: spacing.lg }}
                        >
                            {processing ? 'Processing...' : 'Submit Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;