import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardContent } from '../../styles/components/Card';
import { Button } from '../../styles/components/Button';
import { theme } from '../../styles/theme/theme';

const DashboardContainer = styled.div`
  padding: ${theme.spacing.xl};
  display: grid;
  gap: ${theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
`;

const SummaryCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
  color: ${theme.colors.primary.contrastText};
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const StatusIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${({ status }) => {
    switch (status) {
      case 'paid':
        return theme.colors.status.success + '20';
      case 'pending':
        return theme.colors.status.warning + '20';
      case 'overdue':
        return theme.colors.status.error + '20';
      default:
        return theme.colors.neutral.light;
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'paid':
        return theme.colors.status.success;
      case 'pending':
        return theme.colors.status.warning;
      case 'overdue':
        return theme.colors.status.error;
      default:
        return theme.colors.neutral.main;
    }
  }};
`;

const Dashboard = () => {
  const [paymentSummary, setPaymentSummary] = useState({
    currentBalance: 0,
    nextPaymentDue: '',
    paymentStatus: 'pending',
    recentPayments: []
  });

  useEffect(() => {
    // TODO: Fetch payment summary from API
    setPaymentSummary({
      currentBalance: 1200.00,
      nextPaymentDue: '2024-03-15',
      paymentStatus: 'pending',
      recentPayments: [
        { id: 1, date: '2024-02-15', amount: 1200.00, status: 'paid' },
        { id: 2, date: '2024-01-15', amount: 1200.00, status: 'paid' }
      ]
    });
  }, []);

  const handleMakePayment = () => {
    // TODO: Implement payment flow
    console.log('Initiating payment flow');
  };

  const handleViewHistory = () => {
    // TODO: Navigate to payment history
    console.log('Navigating to payment history');
  };

  return (
    <DashboardContainer>
      {/* Payment Summary Card */}
      <SummaryCard>
        <CardHeader>
          <h2>Payment Summary</h2>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: theme.spacing.md }}>
            <h3 style={{ color: 'inherit', marginBottom: theme.spacing.xs }}>
              Current Balance
            </h3>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold }}>
              ${paymentSummary.currentBalance.toFixed(2)}
            </div>
          </div>
          <div style={{ marginBottom: theme.spacing.md }}>
            <h4 style={{ color: 'inherit', marginBottom: theme.spacing.xs }}>
              Next Payment Due
            </h4>
            <div>{new Date(paymentSummary.nextPaymentDue).toLocaleDateString()}</div>
          </div>
          <StatusIndicator status={paymentSummary.paymentStatus}>
            {paymentSummary.paymentStatus.charAt(0).toUpperCase() + paymentSummary.paymentStatus.slice(1)}
          </StatusIndicator>
        </CardContent>
      </SummaryCard>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <h3>Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <QuickActionsGrid>
            <Button onClick={handleMakePayment} size="lg">
              Make Payment
            </Button>
            <Button variant="outline" onClick={handleViewHistory} size="lg">
              Payment History
            </Button>
          </QuickActionsGrid>
        </CardContent>
      </Card>

      {/* Recent Payments Card */}
      <Card>
        <CardHeader>
          <h3>Recent Payments</h3>
        </CardHeader>
        <CardContent>
          {paymentSummary.recentPayments.map(payment => (
            <div
              key={payment.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.sm,
                borderBottom: `1px solid ${theme.colors.neutral.border}`
              }}
            >
              <div>
                <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
                  ${payment.amount.toFixed(2)}
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral.main }}>
                  {new Date(payment.date).toLocaleDateString()}
                </div>
              </div>
              <StatusIndicator status={payment.status}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </StatusIndicator>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard; 