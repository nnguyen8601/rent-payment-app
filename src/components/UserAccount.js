import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserAccount = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
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

        // Extract email from claims - update to match your B2C configuration
        const emailClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'Email Addresses' || 
                 claim.typ === 'emails' || 
                 claim.typ === 'email'
        );
        
        // Extract name from claims
        const firstNameClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'FirstName' || 
                 claim.typ === 'given_name'
        );

        const lastNameClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'LastName' || 
                 claim.typ === 'family_name'
        );
        
        // If claims are found, use them to set user information
        const email = emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
        console.log("Using email:", email);
        
        // Try to get user data
        const response = await fetch(`/api/get-user-data?email=${encodeURIComponent(email)}`);
        
        if (response.status === 404) {
          // User needs to register
          console.log("User not found, redirecting to registration");
          navigate('/register');
          return;
        }
        
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
  }, [navigate]);
  
  if (loading) return <div className="loading">Loading your account information...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!userData) return null;

  return (
    <div className="account-container">
      <h1>Welcome, {userData.firstName} {userData.lastName}</h1>
      
      <div className="account-info">
        <h2>Account Information</h2>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Property:</strong> {userData.propertyName}</p>
      </div>

      <div className="payment-status">
        <h2>Rent Payment Status</h2>
        {userData.hasPaidCurrentMonth ? (
          <div className="paid-status">
            <span className="checkmark">✓</span>
            <span>Rent paid for this month</span>
          </div>
        ) : (
          <div className="unpaid-status">
            <p className="warning">
              <span className="warning-icon">⚠</span>
              <span>Rent payment pending for this month</span>
            </p>
            <button 
              onClick={() => navigate('/payment')}
              className="pay-button"
            >
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount; 