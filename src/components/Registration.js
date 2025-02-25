import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    propertyId: ''
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch properties from API
    fetch('/api/get-properties')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
      })
      .then(data => {
        setProperties(data);
      })
      .catch(err => {
        console.error('Error fetching properties:', err);
        // Fallback to hardcoded properties in case of API error
        setProperties([
          { id: 1, name: 'CILA 1' },
          { id: 2, name: 'CILA 2' },
          { id: 3, name: 'CILA 3' },
          { id: 4, name: 'CILA 4' },
          { id: 5, name: 'CILA 5' },
          { id: 6, name: 'CILA 6' },
          { id: 7, name: 'CILA 7' },
          { id: 8, name: 'CILA 8' }
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get user email from B2C token
      const authResponse = await fetch('/.auth/me');
      const authData = await authResponse.json();
      console.log('Auth data:', authData); // For debugging

      // Try to get email from claims
      const emailClaim = authData.clientPrincipal.claims.find(
        claim => claim.typ === 'emails' || claim.typ === 'email'
      );

      const email = emailClaim ? emailClaim.val : authData.clientPrincipal.userDetails;
      console.log('Using email:', email);

      // Save user data
      const response = await fetch('/api/save-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email
        }),
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
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Property</label>
          <select
            value={formData.propertyId}
            onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select a property</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Complete Registration'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
        )}
      </form>
    </div>
  );
};

export default Registration; 