import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import PaymentWizard from './components/payments/PaymentWizard/PaymentWizard';
import Login from './components/Login';
import Registration from './components/Registration';
import UserAccount from './components/UserAccount';
import { GlobalStyles } from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.neutral.light};
`;

const MainContent = styled.main`
  padding-top: calc(64px + ${theme.spacing.xl}); // Navigation height + padding
  padding-bottom: ${theme.spacing.xl};
  min-height: calc(100vh - 64px); // Full height minus navigation
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.neutral.light};
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.xl};
`;

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen>Loading...</LoadingScreen>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <AppContainer>
        {isAuthenticated && <Navigation />}
        <MainContent>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <PaymentWizard />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <UserAccount />
                </PrivateRoute>
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Registration />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;