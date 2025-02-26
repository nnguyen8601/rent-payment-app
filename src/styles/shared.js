// Common colors, spacing, and styles
export const colors = {
    primary: '#007bff',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    gray: '#6c757d'
};

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
};

export const shadows = {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.1)'
};

export const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: colors.white,
    borderRadius: '8px',
    boxShadow: shadows.medium
};

export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        color: colors.white,
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#0056b3'
        }
    },
    danger: {
        backgroundColor: colors.danger,
        color: colors.white,
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#c82333'
        }
    }
}; 