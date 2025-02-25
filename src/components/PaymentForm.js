// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentForm.css';

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
            // Create payment intent
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    renterName: `${userData.firstName} ${userData.lastName}`,
                    rentLocation: userData.propertyName
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment processing failed');
            }
            
            const data = await response.json();
            
            // Handle form submission
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }
            
            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret: data.clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-complete`,
                }
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
    
    if (loading) return <div className="loading">Loading payment information...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!userData) return null;

    return (
        <div className="payment-container">
            <h1>Make a Payment</h1>
            
            <div className="user-details">
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Property:</strong> {userData.propertyName}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Payment Amount ($)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        step="0.01"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Payment Details</label>
                    <PaymentElement />
                </div>
                
                <button 
                    type="submit"
                    disabled={!stripe || processing || !amount}
                    className="submit-button"
                >
                    {processing ? 'Processing...' : 'Submit Payment'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;