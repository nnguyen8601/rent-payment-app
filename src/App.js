import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './components/PaymentForm';
import PaymentComplete from './components/PaymentComplete';
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
    return (
        <Router>
            <div className="App">
                <h1>Rent Payment</h1>
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <Elements stripe={stripePromise} options={options}>
                                <PaymentForm />
                            </Elements>
                        } 
                    />
                    <Route 
                        path="/payment-complete" 
                        element={
                            <Elements stripe={stripePromise}>
                                <PaymentComplete />
                            </Elements>
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;