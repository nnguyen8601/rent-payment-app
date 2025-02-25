import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [claimsDebug, setClaimsDebug] = useState('');

  useEffect(() => {
    async function initialize() {
      try {
        // Get user info from B2C
        const authResponse = await fetch('/.auth/me');
        const authData = await authResponse.json();
        console.log('Full auth data:', authData);
        
        if (!authData.clientPrincipal) {
          throw new Error('Not authenticated');
        }
        
        // Debug claims
        if (authData.clientPrincipal?.claims) {
          setClaimsDebug(JSON.stringify(authData.clientPrincipal.claims, null, 2));
        }
        
        // Extract name claims
        const firstNameClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'FirstName' || 
                 claim.typ.includes('givenname')
        );
        
        const lastNameClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'LastName' || 
                 claim.typ.includes('surname')
        );
        
        const emailClaim = authData.clientPrincipal.claims.find(
          claim => claim.typ === 'Email Addresses' || 
                 claim.typ === 'emails' || 
                 claim.typ === 'email'
        );
        
        setUserInfo({
          firstName: firstNameClaim ? firstNameClaim.val : '',
          lastName: lastNameClaim ? lastNameClaim.val : '',
          email: emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails
        });
        
        // Fetch properties list
        const propertiesResponse = await fetch('/api/get-properties');
        if (!propertiesResponse.ok) {
          throw new Error('Failed to load properties');
        }
        
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.email || !selectedProperty) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/save-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          propertyId: selectedProperty
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      // Redirect to user account page
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="registration-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Complete Your Registration</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>First Name</label>
          <input 
            type="text"
            value={userInfo.firstName}
            onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Last Name</label>
          <input 
            type="text"
            value={userInfo.lastName}
            onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input 
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Select Your Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          >
            <option value="">-- Select a property --</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={submitting}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Submitting...' : 'Complete Registration'}
        </button>
      </form>
      
      {claimsDebug && (
        <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Debug: Available Claims</h3>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>{claimsDebug}</pre>
        </div>
      )}
    </div>
  );
};

export default Registration; 