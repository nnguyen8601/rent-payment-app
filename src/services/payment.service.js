import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class PaymentService {
  async getPaymentSummary() {
    try {
      const response = await axios.get(`${API_URL}/payments/summary`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentHistory() {
    try {
      const response = await axios.get(`${API_URL}/payments/history`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processPayment(paymentData) {
    try {
      const response = await axios.post(`${API_URL}/payments/process`, paymentData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validatePaymentMethod(paymentMethod) {
    try {
      const response = await axios.post(
        `${API_URL}/payments/validate-method`,
        paymentMethod,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSavedPaymentMethods() {
    try {
      const response = await axios.get(`${API_URL}/payments/methods`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async savePaymentMethod(paymentMethod) {
    try {
      const response = await axios.post(
        `${API_URL}/payments/methods`,
        paymentMethod,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePaymentMethod(methodId) {
    try {
      const response = await axios.delete(
        `${API_URL}/payments/methods/${methodId}`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    } else {
      // Error setting up request
      return new Error('Error setting up request');
    }
  }
}

export default new PaymentService(); 