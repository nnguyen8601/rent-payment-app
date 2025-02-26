import React from 'react';
import { colors } from '../../styles/shared';

const Loading = ({ message = 'Loading...' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: '20px'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: `4px solid ${colors.light}`,
                borderTop: `4px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
            }} />
            <p style={{
                color: colors.gray,
                fontSize: '16px',
                margin: 0
            }}>
                {message}
            </p>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default Loading; 