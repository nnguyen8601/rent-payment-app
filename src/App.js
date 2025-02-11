import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './components/PaymentForm';
import './styles/App.css';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('your_publishable_key_here');

const App = () => {
    return (
        <div className="App">
            <h1>Rent Payment</h1>
            <Elements stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        </div>
    );
};

export default App;