import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardHeader, CardContent } from '../styles/components/Card';
import { Input, InputWrapper, Label, ErrorMessage } from '../styles/components/Input';
import { Button } from '../styles/components/Button';
import { theme } from '../styles/theme/theme';
import { useAuth } from '../context/AuthContext';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.md};
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  
  h1 {
    color: ${theme.colors.primary.main};
    font-size: ${theme.typography.fontSize['3xl']};
    margin-bottom: ${theme.spacing.xs};
  }
  
  p {
    color: ${theme.colors.neutral.main};
    font-size: ${theme.typography.fontSize.base};
  }
`;

const StyledCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Registration = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    apartmentNumber: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.apartmentNumber) {
      newErrors.apartmentNumber = 'Apartment number is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number before sending
      const formattedData = {
        ...formData,
        phoneNumber: formData.phoneNumber.replace(/\D/g, '')
      };
      delete formattedData.confirmPassword;

      await register(formattedData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to register. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Logo>
        <h1>Rent Payment Portal</h1>
        <p>Create your account to get started.</p>
      </Logo>
      
      <StyledCard>
        <CardHeader>
          <h2>Register</h2>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <InputWrapper>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
              </InputWrapper>

              <InputWrapper>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  error={errors.lastName}
                  autoComplete="family-name"
                />
                {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
              </InputWrapper>
            </FormGrid>

            <InputWrapper style={{ marginTop: theme.spacing.md }}>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                error={errors.email}
                autoComplete="email"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputWrapper>

            <FormGrid style={{ marginTop: theme.spacing.md }}>
              <InputWrapper>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  error={errors.password}
                  autoComplete="new-password"
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              </InputWrapper>

              <InputWrapper>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
              </InputWrapper>
            </FormGrid>

            <FormGrid style={{ marginTop: theme.spacing.md }}>
              <InputWrapper>
                <Label htmlFor="apartmentNumber">Apartment Number</Label>
                <Input
                  id="apartmentNumber"
                  type="text"
                  name="apartmentNumber"
                  value={formData.apartmentNumber}
                  onChange={handleInputChange}
                  placeholder="Enter apartment number"
                  error={errors.apartmentNumber}
                  autoComplete="address-line2"
                />
                {errors.apartmentNumber && <ErrorMessage>{errors.apartmentNumber}</ErrorMessage>}
              </InputWrapper>

              <InputWrapper>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  error={errors.phoneNumber}
                  autoComplete="tel"
                />
                {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber}</ErrorMessage>}
              </InputWrapper>
            </FormGrid>

            {errors.submit && (
              <ErrorMessage style={{ marginTop: theme.spacing.md }}>
                {errors.submit}
              </ErrorMessage>
            )}

            <Button
              type="submit"
              style={{ width: '100%', marginTop: theme.spacing.lg }}
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </StyledCard>

      <div style={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: theme.colors.primary.main }}>
          Login here
        </Link>
      </div>
    </RegisterContainer>
  );
};

export default Registration; 