import React from 'react';
import PaymentForm from './components/PaymentForm';
import './styles/App.css';

const App = () => {
    return (
        <div className="App">
            <h1>Rent Payment</h1>
            <PaymentForm />
        </div>
    );
};

export default App;