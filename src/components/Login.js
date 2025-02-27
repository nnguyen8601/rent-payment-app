import React from 'react';
import { colors, containerStyles, buttonStyles } from '../styles/shared';

const Login = () => {
  const handleLogin = () => {
    // Get the current URL for redirect
    const currentOrigin = window.location.origin;
    
    // Construct the login URL with post_login_redirect_uri
    const loginUrl = `/.auth/login/aadb2c?post_login_redirect_uri=${encodeURIComponent(currentOrigin)}`;
    
    // Redirect to the login URL
    window.location.href = loginUrl;
  };

  return (
    <div className="page-container fade-in">
      <div style={{
        ...containerStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <h1 style={{ color: colors.dark, marginBottom: '32px' }}>
          Welcome to Rent Payment Portal
        </h1>
        
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: colors.gray, marginBottom: '24px' }}>
            Please log in to access your account and make payments
          </p>
          
          <button
            onClick={handleLogin}
            className="btn btn-primary"
            style={{
              ...buttonStyles.primary,
              width: '100%',
              padding: '12px'
            }}
          >
            Login with Azure AD B2C
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 