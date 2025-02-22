import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './components/PaymentForm';
import PaymentComplete from './components/PaymentComplete';
import Login from './components/Login';
import Logout from './components/Logout';
import UserAccount from './components/UserAccount';
import Registration from './components/Registration';
import './styles/App.css';

// Add more detailed logging
console.log('Environment:', process.env.NODE_ENV);
console.log('Stripe Key Length:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.length);
console.log('Stripe Key Prefix:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.substring(0, 7));

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Add this for debugging
console.log('Stripe initialized:', !!stripePromise);
console.log('Stripe Key Present:', !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Configure Stripe Elements
const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    // Customize the appearance
    appearance: {
        theme: 'stripe',
        variables: {
            colorPrimary: '#007bff',
        },
    },
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        // Check authentication status
        fetch('/.auth/me')
            .then(response => response.json())
            .then(data => {
                setIsAuthenticated(!!data.clientPrincipal);
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className="App">
                {isAuthenticated ? (
                    <>
                        <Logout />
                        <Routes>
                            <Route path="/" element={<UserAccount />} />
                            <Route path="/register" element={<Registration />} />
                            <Route path="/payment" element={<PaymentForm />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </>
                ) : (
                    <Routes>
                        <Route path="*" element={<Login />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
};

export default App;