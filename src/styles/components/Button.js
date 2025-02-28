import styled from 'styled-components';
import { theme } from '../theme/theme';

export const Button = styled.button`
  // Base styles
  padding: ${({ size = 'md' }) => 
    size === 'sm' ? '0.5rem 1rem' :
    size === 'lg' ? '1rem 2rem' :
    '0.75rem 1.5rem'
  };
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${({ size = 'md' }) =>
    size === 'sm' ? theme.typography.fontSize.sm :
    size === 'lg' ? theme.typography.fontSize.lg :
    theme.typography.fontSize.base
  };
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  // Variant styles
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'secondary':
        return `
          background-color: ${theme.colors.secondary.main};
          color: ${theme.colors.secondary.contrastText};
          &:hover {
            background-color: ${theme.colors.secondary.dark};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 2px solid ${theme.colors.primary.main};
          color: ${theme.colors.primary.main};
          &:hover {
            background-color: ${theme.colors.primary.main}10;
          }
        `;
      case 'text':
        return `
          background-color: transparent;
          color: ${theme.colors.primary.main};
          padding: 0;
          &:hover {
            background-color: transparent;
            color: ${theme.colors.primary.dark};
            text-decoration: underline;
          }
        `;
      default: // primary
        return `
          background-color: ${theme.colors.primary.main};
          color: ${theme.colors.primary.contrastText};
          &:hover {
            background-color: ${theme.colors.primary.dark};
          }
        `;
    }
  }}

  // Disabled state
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      background-color: ${({ variant = 'primary' }) =>
        variant === 'primary' ? theme.colors.primary.main :
        variant === 'secondary' ? theme.colors.secondary.main :
        'transparent'
      };
    }
  }

  // Loading state
  ${({ isLoading }) => isLoading && `
    position: relative;
    pointer-events: none;
    opacity: 0.8;
    
    &::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid;
      border-radius: 50%;
      border-color: currentColor currentColor currentColor transparent;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}
`; 