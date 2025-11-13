import api from '../axiosConfig';
import { tokenService } from './tokenService';

// Test credentials - REMOVE IN PRODUCTION
const TEST_ADMIN = {
  email: 'admin@brokerin.com',
  password: 'admin123'
};

export const authService = {
  login: async (credentials) => {
    try {
      // For test admin account, bypass API call
      if (credentials.email === TEST_ADMIN.email && credentials.password === TEST_ADMIN.password) {
        const mockResponse = {
          user: {
            id: 'admin-123',
            email: TEST_ADMIN.email,
            name: 'Admin User',
            role: 'admin'
          },
          token: 'test-admin-token',
          refreshToken: 'test-refresh-token'
        };
        tokenService.setTokens(mockResponse.token, mockResponse.refreshToken);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      }

      // Regular API login - backend expects identifier and password
      console.log('Sending login request with:', { identifier: credentials.email, password: '***' });
      const response = await api.post('/api/auth/signin', {
        identifier: credentials.email,  // Backend expects 'identifier' not 'email'
        password: credentials.password
      });
      console.log('Login API response:', response.data);

      // Store tokens using token service
      if (response.data.token) {
        tokenService.setTokens(response.data.token, response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Invalid email or password';
        const err = new Error(errorMessage);
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  requestSignupOtp: async (payload) => {
    try {
      const response = await api.post('/api/auth/pre-signup/request-otp', payload);
      return response.data; // { message }
    } catch (error) {
      console.error('Request Signup OTP error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to send OTP';
        const err = new Error(errorMessage);
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  verifyPreSignupOtp: async ({ email, otp }) => {
    try {
      const response = await api.post('/api/auth/pre-signup/verify-otp', { email, otp });
      return response.data; // { message }
    } catch (error) {
      console.error('Verify Pre-Signup OTP error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Invalid or expired OTP';
        const err = new Error(errorMessage);
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data; // { message }
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response) {
        const err = new Error(error.response.data?.message || error.response.data?.error || 'Failed to request password reset');
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  verifyResetToken: async (email, token) => {
    try {
      const response = await api.post('/api/auth/reset-password/verify', { email, token });
      return response.data; // { message }
    } catch (error) {
      console.error('Verify reset token error:', error);
      if (error.response) {
        const err = new Error(error.response.data?.message || error.response.data?.error || 'Invalid or expired token');
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  resetPassword: async (email, token, newPassword) => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, token, newPassword });
      return response.data; // { message }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response) {
        const err = new Error(error.response.data?.message || error.response.data?.error || 'Failed to reset password');
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  googleAuth: async (token) => {
    try {
      const response = await api.post('/api/auth/google-auth', { token });
      const data = response.data || {};
      if (data.accessToken) {
        tokenService.setTokens(data.accessToken, data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data || {};
        const message = data.message || data.error || data.msg || `Google login failed (${status})`;
        const err = new Error(message);
        err.status = status;
        err.responseData = data;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  signup: async (userData) => {
    try {
      // If caller already provided FormData, send as-is
      if (typeof FormData !== 'undefined' && userData instanceof FormData) {
        const response = await api.post('/api/auth/signup', userData);
        return response.data;
      }

      const fullName = userData.fullName || userData.username || '';
      const username = userData.username || fullName.toLowerCase().replace(/\s+/g, '');
      const email = userData.email;
      const phoneNumber = userData.phoneNumber || userData.phone || '';
      const password = userData.password;
      const nationality = userData.nationality; // optional

      // If there's a file, use FormData; otherwise send JSON
      if (userData.profilePicture) {
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('username', username);
        formData.append('email', email);
        if (phoneNumber) formData.append('phoneNumber', phoneNumber);
        if (nationality) formData.append('nationality', nationality);
        formData.append('password', password);
        formData.append('profilePicture', userData.profilePicture);
        const response = await api.post('/api/auth/signup', formData);
        return response.data;
      } else {
        const payload = {
          fullName,
          username,
          email,
          phoneNumber: phoneNumber || undefined,
          password,
          ...(nationality ? { nationality } : {})
        };
        const response = await api.post('/api/auth/signup', payload);
        return response.data;
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Failed to create account. Please check your information and try again.';
        const err = new Error(errorMessage);
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  verifyOtp: async ({ email, otp }) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Invalid or expired OTP';
        const err = new Error(errorMessage);
        err.status = error.response.status;
        throw err;
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  logout: () => {
    tokenService.clearTokens();
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return tokenService.isAuthenticated() && !!localStorage.getItem('user');
  },

  checkAdmin: async () => {
    try {
      const response = await api.get('/api/auth/check-admin');
      return response.data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  isAdmin: async (user) => {
    try {
      const isAdmin = await authService.checkAdmin();
      return isAdmin;
    } catch (error) {
      console.error('Error in isAdmin check:', error);
      return false;
    }
  }
}; 