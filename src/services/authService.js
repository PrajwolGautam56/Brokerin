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
        throw new Error(errorMessage);
      }
      throw new Error('Failed to connect to server. Please check your internet connection.');
    }
  },

  signup: async (userData) => {
    try {
      const signupData = {
        fullName: userData.fullName,
        username: userData.fullName.toLowerCase().replace(/\s+/g, ''),
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        nationality: "IN",
        password: userData.password
      };

      const response = await api.post('/api/auth/signup', signupData);

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
      console.error('Signup error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Failed to create account. Please check your information and try again.';
        throw new Error(errorMessage);
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