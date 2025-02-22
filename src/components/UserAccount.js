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
        const authResponse = await fetch('/.auth/me');
        const authData = await authResponse.json();

        if (authData.clientPrincipal) {
          setUserInfo(authData.clientPrincipal);
          
          // Check if user exists in our database
          const tenantResponse = await fetch(`/api/tenant-by-email?email=${encodeURIComponent(authData.clientPrincipal.userDetails)}`);
          const tenantData = await tenantResponse.json();
          
          if (tenantResponse.ok) {
            setTenantInfo(tenantData);
          } else {
            // Redirect to registration if user doesn't exist
            navigate('/register');
          }
        }
      } catch (err) {
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
        marginBottom: '20px'
      }}>
        <h2>Account Information</h2>
        <p>Email: {userInfo.userDetails}</p>
        <p>Property: {tenantInfo.propertyName}</p>
        <p>Monthly Rent: ${tenantInfo.monthlyRent}</p>
      </div>

      <div className="payment-status" style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px' 
      }}>
        <h2>Rent Payment Status</h2>
        {tenantInfo.hasPaidCurrentMonth ? (
          <div style={{ color: 'green' }}>
            <p>✓ Rent paid for this month</p>
            <p>Last payment: {new Date(tenantInfo.lastPaymentDate).toLocaleDateString()}</p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'red' }}>❗ Rent payment pending for this month</p>
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