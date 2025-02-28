import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardHeader, CardContent } from '../styles/components/Card';
import { Input, InputWrapper, Label, ErrorMessage } from '../styles/components/Input';
import { Button } from '../styles/components/Button';
import { theme } from '../styles/theme/theme';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  max-width: 400px;
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

const FormDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: ${theme.spacing.md} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.neutral.border};
  }
  
  span {
    padding: 0 ${theme.spacing.sm};
    color: ${theme.colors.neutral.main};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to login. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Logo>
        <h1>Rent Payment Portal</h1>
        <p>Welcome back! Please login to your account.</p>
      </Logo>
      
      <StyledCard>
        <CardHeader>
          <h2>Login</h2>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <InputWrapper>
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

            <InputWrapper style={{ marginTop: theme.spacing.md }}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                error={errors.password}
                autoComplete="current-password"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputWrapper>

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
              Login
            </Button>
          </form>

          <FormDivider>
            <span>OR</span>
          </FormDivider>

          <Button
            variant="outline"
            style={{ width: '100%' }}
            as={Link}
            to="/register"
          >
            Create New Account
          </Button>
        </CardContent>
      </StyledCard>

      <div style={{ textAlign: 'center' }}>
        <Link to="/forgot-password" style={{ color: theme.colors.primary.main }}>
          Forgot your password?
        </Link>
      </div>
    </LoginContainer>
  );
};

export default Login; 