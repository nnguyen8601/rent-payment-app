import styled from 'styled-components';
import { theme } from '../theme/theme';

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const Label = styled.label`
  color: ${theme.colors.neutral.main};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${({ error }) => 
    error ? theme.colors.status.error : theme.colors.neutral.border
  };
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.neutral.dark};
  background-color: ${theme.colors.neutral.background};
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background-color: ${theme.colors.neutral.light};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.neutral.main}80;
  }
`;

export const ErrorMessage = styled.span`
  color: ${theme.colors.status.error};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const HelperText = styled.span`
  color: ${theme.colors.neutral.main};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

// Select component with similar styling
export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${({ error }) => 
    error ? theme.colors.status.error : theme.colors.neutral.border
  };
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.neutral.dark};
  background-color: ${theme.colors.neutral.background};
  transition: all ${theme.transitions.normal};
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.sm} center;
  background-size: 1em;
  padding-right: ${theme.spacing.xl};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background-color: ${theme.colors.neutral.light};
    cursor: not-allowed;
  }
`;

// Textarea component with similar styling
export const Textarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${({ error }) => 
    error ? theme.colors.status.error : theme.colors.neutral.border
  };
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.neutral.dark};
  background-color: ${theme.colors.neutral.background};
  transition: all ${theme.transitions.normal};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background-color: ${theme.colors.neutral.light};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.neutral.main}80;
  }
`; 