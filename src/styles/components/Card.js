import styled from 'styled-components';
import { theme } from '../theme/theme';

export const Card = styled.div`
  background-color: ${theme.colors.neutral.background};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.lg};
  transition: all ${theme.transitions.normal};

  ${({ variant = 'default' }) => {
    switch (variant) {
      case 'hover':
        return `
          cursor: pointer;
          &:hover {
            transform: translateY(-4px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
      case 'bordered':
        return `
          border: 1px solid ${theme.colors.neutral.border};
          box-shadow: none;
        `;
      case 'flat':
        return `
          box-shadow: none;
          background-color: ${theme.colors.neutral.light};
        `;
      default:
        return '';
    }
  }}
`;

export const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.neutral.border};

  h2, h3, h4 {
    margin: 0;
    color: ${theme.colors.neutral.dark};
    font-family: ${theme.typography.fontFamily.primary};
    font-weight: ${theme.typography.fontWeight.medium};
  }
`;

export const CardContent = styled.div`
  color: ${theme.colors.neutral.main};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
`;

export const CardFooter = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.neutral.border};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`; 