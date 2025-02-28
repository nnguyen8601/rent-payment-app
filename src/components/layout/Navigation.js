import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme/theme';

const NavContainer = styled.nav`
  background-color: ${theme.colors.neutral.background};
  box-shadow: ${theme.shadows.sm};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: ${theme.colors.neutral.background};
    padding: ${theme.spacing.md};
    box-shadow: ${theme.shadows.md};
  }
`;

const NavLink = styled(Link)`
  color: ${({ active }) => 
    active ? theme.colors.primary.main : theme.colors.neutral.main};
  text-decoration: none;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.normal};

  &:hover {
    color: ${theme.colors.primary.main};
    background-color: ${theme.colors.primary.main}10;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  color: ${theme.colors.neutral.main};

  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/dashboard">Rent Payment Portal</Logo>
        
        <MenuButton onClick={toggleMenu} aria-label="Toggle menu">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </MenuButton>

        <NavLinks isOpen={isMenuOpen}>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>
            Dashboard
          </NavLink>
          <NavLink to="/payment" active={isActive('/payment')}>
            Make Payment
          </NavLink>
          <NavLink to="/account" active={isActive('/account')}>
            Account
          </NavLink>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation; 