import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardContent } from '../styles/components/Card';
import { Input, InputWrapper, Label, ErrorMessage } from '../styles/components/Input';
import { Button } from '../styles/components/Button';
import { theme } from '../styles/theme/theme';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';

const AccountContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.md};
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

const UserAccount = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    apartmentNumber: user?.apartmentNumber || ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await UserService.getUserProfile();
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        apartmentNumber: profile.apartmentNumber || ''
      });
    } catch (error) {
      setErrors({ submit: 'Failed to load user profile' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.apartmentNumber) {
      newErrors.apartmentNumber = 'Apartment number is required';
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
    setSuccessMessage('');
    
    try {
      await UserService.updateUserProfile(formData);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountContainer>
      <StyledCard>
        <CardHeader>
          <h2>Account Settings</h2>
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
                disabled
                autoComplete="email"
              />
            </InputWrapper>

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

            {successMessage && (
              <div
                style={{
                  color: theme.colors.success.main,
                  marginTop: theme.spacing.md,
                  textAlign: 'center'
                }}
              >
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              style={{ width: '100%', marginTop: theme.spacing.lg }}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </StyledCard>
    </AccountContainer>
  );
};

export default UserAccount; 