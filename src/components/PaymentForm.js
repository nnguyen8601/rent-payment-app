// filepath: rent-payment-app/rent-payment-app/src/components/PaymentForm.js
import React, { useState } from 'react';
import '../styles/PaymentForm.css';

const PaymentForm = () => {
    // Add rental properties data
    const rentalProperties = [
        { id: 1, address: '123 Main St, Chicago, IL 60601' },
        { id: 2, address: '456 Park Ave, Chicago, IL 60602' },
        { id: 3, address: '789 Lake St, Chicago, IL 60603' },
        { id: 4, address: '321 State St, Chicago, IL 60604' },
        // Add more properties as needed
    ];

    const [formData, setFormData] = useState({
        renterName: '',
        rentLocation: '', // This will store the selected property address
        cardNumber: '',
        expirationDate: '',
        cvc: '',
        zipCode: '',
        amount: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle payment submission here
        console.log('Payment submitted:', formData);
    };

    return (
        <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="renterName">Renter's Name</label>
                    <input
                        type="text"
                        id="renterName"
                        name="renterName"
                        value={formData.renterName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="rentLocation">Rental Property Address</label>
                    <select
                        id="rentLocation"
                        name="rentLocation"
                        value={formData.rentLocation}
                        onChange={handleChange}
                        required
                        className="select-input"
                    >
                        <option value="">Select a property</option>
                        {rentalProperties.map(property => (
                            <option key={property.id} value={property.address}>
                                {property.address}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Payment Amount ($)</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        maxLength="16"
                        placeholder="1234 5678 9012 3456"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group half-width">
                        <label htmlFor="expirationDate">Expiration Date</label>
                        <input
                            type="text"
                            id="expirationDate"
                            name="expirationDate"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                        />
                    </div>

                    <div className="form-group half-width">
                        <label htmlFor="cvc">CVC</label>
                        <input
                            type="text"
                            id="cvc"
                            name="cvc"
                            value={formData.cvc}
                            onChange={handleChange}
                            maxLength="3"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="zipCode">Billing Zip Code</label>
                    <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        maxLength="5"
                        required
                    />
                </div>

                <button type="submit" className="submit-button">
                    Submit Payment
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;