import React from 'react';
import { colors } from '../../styles/shared';

const Error = ({ message, onRetry }) => {
    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff3f3',
            border: `1px solid ${colors.danger}`,
            borderRadius: '4px',
            textAlign: 'center',
            margin: '20px 0'
        }}>
            <p style={{
                color: colors.danger,
                marginBottom: onRetry ? '16px' : '0'
            }}>
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        backgroundColor: colors.danger,
                        color: colors.white,
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default Error; 