import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardContent, CardFooter } from '../../../styles/components/Card';
import { Button } from '../../../styles/components/Button';
import { Input, Select, Label, InputWrapper, ErrorMessage } from '../../../styles/components/Input';
import { theme } from '../../../styles/theme/theme';

const WizardContainer = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${theme.colors.neutral.border};
    transform: translateY(-50%);
    z-index: 0;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ active, completed }) =>
    completed ? theme.colors.primary.main :
    active ? theme.colors.primary.light :
    theme.colors.neutral.light};
  color: ${({ active, completed }) =>
    completed || active ? theme.colors.primary.contrastText :
    theme.colors.neutral.main};
  font-weight: ${theme.typography.fontWeight.medium};
  position: relative;
  z-index: 1;
  transition: all ${theme.transitions.normal};
`;

const StepLabel = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.neutral.main};
  margin-top: ${theme.spacing.xs};
`;

const PaymentWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState({});

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

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.amount) {
          newErrors.amount = 'Please enter payment amount';
        }
        break;
      case 2:
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        if (formData.paymentMethod === 'card') {
          if (!formData.cardNumber) {
            newErrors.cardNumber = 'Please enter card number';
          }
          if (!formData.expiryDate) {
            newErrors.expiryDate = 'Please enter expiry date';
          }
          if (!formData.cvv) {
            newErrors.cvv = 'Please enter CVV';
          }
          if (!formData.name) {
            newErrors.name = 'Please enter cardholder name';
          }
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      // TODO: Implement payment submission
      console.log('Submitting payment:', formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <InputWrapper>
              <Label>Payment Amount ($)</Label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                error={errors.amount}
              />
              {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}
            </InputWrapper>
          </>
        );
      case 2:
        return (
          <>
            <InputWrapper>
              <Label>Payment Method</Label>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                error={errors.paymentMethod}
              >
                <option value="">Select payment method</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
              </Select>
              {errors.paymentMethod && <ErrorMessage>{errors.paymentMethod}</ErrorMessage>}
            </InputWrapper>

            {formData.paymentMethod === 'card' && (
              <>
                <InputWrapper>
                  <Label>Card Number</Label>
                  <Input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    error={errors.cardNumber}
                  />
                  {errors.cardNumber && <ErrorMessage>{errors.cardNumber}</ErrorMessage>}
                </InputWrapper>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <InputWrapper>
                    <Label>Expiry Date</Label>
                    <Input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      error={errors.expiryDate}
                    />
                    {errors.expiryDate && <ErrorMessage>{errors.expiryDate}</ErrorMessage>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>CVV</Label>
                    <Input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      error={errors.cvv}
                    />
                    {errors.cvv && <ErrorMessage>{errors.cvv}</ErrorMessage>}
                  </InputWrapper>
                </div>

                <InputWrapper>
                  <Label>Cardholder Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    error={errors.name}
                  />
                  {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </InputWrapper>
              </>
            )}
          </>
        );
      case 3:
        return (
          <div style={{ textAlign: 'center' }}>
            <h3>Review Payment</h3>
            <div style={{ margin: theme.spacing.md }}>
              <p>Amount: ${formData.amount}</p>
              <p>Payment Method: {formData.paymentMethod}</p>
              {formData.paymentMethod === 'card' && (
                <p>Card ending in: {formData.cardNumber.slice(-4)}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <WizardContainer>
      <CardHeader>
        <h2>Make a Payment</h2>
      </CardHeader>

      <StepIndicator>
        {[1, 2, 3].map((step) => (
          <div key={step} style={{ textAlign: 'center' }}>
            <Step
              active={currentStep === step}
              completed={currentStep > step}
            >
              {currentStep > step ? '✓' : step}
            </Step>
            <StepLabel>
              {step === 1 ? 'Amount' :
               step === 2 ? 'Payment Method' :
               'Review'}
            </StepLabel>
          </div>
        ))}
      </StepIndicator>

      <CardContent>
        {renderStepContent()}
      </CardContent>

      <CardFooter>
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            Confirm Payment
          </Button>
        )}
      </CardFooter>
    </WizardContainer>
  );
};

export default PaymentWizard; 