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
        console.log('Fetching auth data...');
        const authResponse = await fetch('/.auth/me');
        const authData = await authResponse.json();
        console.log('Auth data:', authData);

        if (authData.clientPrincipal) {
          setUserInfo(authData.clientPrincipal);
          const userEmail = authData.clientPrincipal.userDetails;
          console.log('User email:', userEmail);
          
          // Check if user exists in our database
          const url = `/api/tenant-by-email?email=${encodeURIComponent(userEmail)}`;
          console.log('Fetching tenant data from:', url);
          
          const tenantResponse = await fetch(url);
          console.log('Tenant response status:', tenantResponse.status);
          
          if (!tenantResponse.ok) {
            if (tenantResponse.status === 404) {
              console.log('User not found, redirecting to registration');
              navigate('/register');
              return;
            }
            const errorData = await tenantResponse.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch tenant data');
          }

          const tenantData = await tenantResponse.json();
          console.log('Tenant data:', tenantData);
          setTenantInfo(tenantData);
        }
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
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
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={e => e.target.style.backgroundColor = '#007bff'}
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