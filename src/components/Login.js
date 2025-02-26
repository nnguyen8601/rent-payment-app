import React from 'react';
import { colors, containerStyles, buttonStyles } from '../styles/shared';

const Login = () => {
  const handleLogin = () => {
    window.location.href = '/.auth/login/aadb2c';
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
        <h1 style={{ color: colors.dark, marginBottom: spacing.xl }}>
          Welcome to Rent Payment Portal
        </h1>
        
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: colors.gray, marginBottom: spacing.lg }}>
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