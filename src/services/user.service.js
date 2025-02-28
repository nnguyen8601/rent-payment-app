import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UserService {
  async getUserProfile() {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePassword(passwordData) {
    try {
      const response = await axios.put(
        `${API_URL}/users/password`,
        passwordData,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await axios.post(`${API_URL}/users/reset-password`, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${API_URL}/users/reset-password/${token}`, {
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationPreferences() {
    try {
      const response = await axios.get(`${API_URL}/users/notifications`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationPreferences(preferences) {
    try {
      const response = await axios.put(
        `${API_URL}/users/notifications`,
        preferences,
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

export default new UserService(); 