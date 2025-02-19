import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = '/.auth/login/aadb2c';
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Welcome to Rent Payment</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Login with Azure AD B2C
      </button>
    </div>
  );
};

export default Login; 