import React from 'react';
import { colors } from '../styles/shared';

const Logout = () => {
  const handleLogout = () => {
    // Get the current URL for redirect
    const currentOrigin = window.location.origin;
    
    // Construct the logout URL with post_logout_redirect_uri
    const logoutUrl = `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(currentOrigin)}`;
    
    // Redirect to the logout URL
    window.location.href = logoutUrl;
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        backgroundColor: colors.danger,
        color: colors.white,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        zIndex: 1000,
        '&:hover': {
          backgroundColor: '#c82333'
        }
      }}
    >
      Logout
    </button>
  );
};

export default Logout; 