import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserAccount = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user info from B2C
        const authResponse = await fetch('/.auth/me');
        const authData = await authResponse.json();

        if (!authData.clientPrincipal) {
          throw new Error('No authentication data found');
        }

        setUserInfo(authData.clientPrincipal);
        console.log('Auth data:', authData.clientPrincipal); // For debugging

        // Try to get email from claims
        const emailClaim = authData.clientPrincipal.claims?.find(
          claim => claim.typ === 'emails' || claim.typ === 'email'
        );

        const userEmail = emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
        console.log('Using email:', userEmail);
        
        // Get user data from database
        const response = await fetch(`/api/get-user-data?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
          // If user data not found, they need to register
          navigate('/register');
          return;
        }

        const data = await response.json();
        setTenantInfo(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tenantInfo) return null;

  return (
    <div className="user-account" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome, {tenantInfo.firstName} {tenantInfo.lastName}</h1>
      
      <div className="account-info" style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Account Information</h2>
        <p><strong>Email:</strong> {tenantInfo.email}</p>
        <p><strong>Property:</strong> {tenantInfo.propertyName}</p>
      </div>

      <div className="payment-status" style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Rent Payment Status</h2>
        {tenantInfo.hasPaidCurrentMonth ? (
          <div style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span>Rent paid for this month</span>
          </div>
        ) : (
          <div>
            <p style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>⚠</span>
              <span>Rent payment pending for this month</span>
            </p>
            <button
              onClick={() => navigate('/payment')}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
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