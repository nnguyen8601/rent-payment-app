import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './components/PaymentForm';
import Login from './components/Login';
import './styles/App.css';

// Add more detailed logging
console.log('Environment:', process.env.NODE_ENV);
console.log('Stripe Key Length:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.length);
console.log('Stripe Key Prefix:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.substring(0, 7));

// Make sure this is your actual publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Add this for debugging
console.log('Stripe initialized:', !!stripePromise);
console.log('Stripe Key Present:', !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const App = () => {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    return (
        <div className="App">
            <h1>Rent Payment</h1>
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : (
                <Elements stripe={stripePromise}>
                    <PaymentForm user={user} />
                </Elements>
            )}
        </div>
    );
};

export default App;