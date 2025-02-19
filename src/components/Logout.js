import React from 'react';

const Logout = () => {
  const handleLogout = async () => {
    try {
      // Add post_logout_redirect_uri to ensure proper redirect after B2C logout
      const logoutUrl = '/.auth/logout?post_logout_redirect_uri=/';
      
      // Use window.location.href instead of fetch
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  );
};

export default Logout; 