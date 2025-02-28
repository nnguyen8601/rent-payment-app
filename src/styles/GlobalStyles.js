import { createGlobalStyle } from 'styled-components';
import { theme } from './theme/theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.neutral.main};
    background-color: ${theme.colors.neutral.background};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.primary};
    font-weight: ${theme.typography.fontWeight.bold};
    line-height: ${theme.typography.lineHeight.tight};
    color: ${theme.colors.neutral.dark};
    margin-bottom: ${theme.spacing.md};
  }

  h1 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h2 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h4 {
    font-size: ${theme.typography.fontSize.lg};
  }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    transition: color ${theme.transitions.normal};

    &:hover {
      color: ${theme.colors.primary.dark};
    }
  }

  button {
    font-family: ${theme.typography.fontFamily.primary};
  }

  // Form elements
  input,
  select,
  textarea {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
  }

  // Utility classes
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }

  .mt-1 { margin-top: ${theme.spacing.xs}; }
  .mt-2 { margin-top: ${theme.spacing.sm}; }
  .mt-3 { margin-top: ${theme.spacing.md}; }
  .mt-4 { margin-top: ${theme.spacing.lg}; }
  .mt-5 { margin-top: ${theme.spacing.xl}; }

  .mb-1 { margin-bottom: ${theme.spacing.xs}; }
  .mb-2 { margin-bottom: ${theme.spacing.sm}; }
  .mb-3 { margin-bottom: ${theme.spacing.md}; }
  .mb-4 { margin-bottom: ${theme.spacing.lg}; }
  .mb-5 { margin-bottom: ${theme.spacing.xl}; }

  // Responsive containers
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};

    @media (max-width: ${theme.breakpoints.md}) {
      padding: 0 ${theme.spacing.sm};
    }
  }

  // Animations
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  // Animation utility classes
  .fade-in {
    animation: fadeIn ${theme.transitions.normal};
  }

  .slide-in {
    animation: slideIn ${theme.transitions.normal};
  }

  // Accessibility
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  // Focus styles
  :focus {
    outline: 3px solid ${theme.colors.primary.main}40;
    outline-offset: 2px;
  }

  // Selection
  ::selection {
    background-color: ${theme.colors.primary.main}40;
    color: ${theme.colors.primary.dark};
  }
`; 