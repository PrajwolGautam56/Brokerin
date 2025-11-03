import api from '../axiosConfig';

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
          token: 'test-admin-token'
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      }

      // Regular API login
      const response = await api.post('/api/auth/signin', {
        identifier: credentials.email,
        password: credentials.password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          user: response.data.user,
          token: response.data.token
        };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        throw error.response.data || { message: 'Login failed. Please try again.' };
      }
      throw { message: 'Failed to connect to server.' };
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

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          user: response.data.user,
          token: response.data.token
        };
      }
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Failed to create account';
        throw { message: errorMessage };
      }
      throw { message: 'An error occurred during signup' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!token && !!user;
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