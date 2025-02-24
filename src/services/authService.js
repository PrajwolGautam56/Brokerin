import api from '../axiosConfig';

export const authService = {
  login: async (credentials) => {
    try {
      // Log the full request details
      console.log('Making login request to:', `${process.env.REACT_APP_API_BASE_URL}/api/auth/signin`);
      console.log('Request payload:', {
        identifier: credentials.email,
        password: credentials.password
      });

      const response = await api.post('/api/auth/signin', {
        identifier: credentials.email,
        password: credentials.password
      });

      console.log('Login response:', {
        status: response.status,
        data: response.data
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
      console.log('Making signup request to:', `${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`);
      
      // Format the request body according to API requirements
      const signupData = {
        fullName: userData.fullName,
        username: userData.fullName.toLowerCase().replace(/\s+/g, ''), // Create username from fullName
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        nationality: "IN", // Default to IN
        password: userData.password
      };

      console.log('Signup payload:', signupData);

      const response = await api.post('/api/auth/signup', signupData);

      console.log('Signup response:', {
        status: response.status,
        data: response.data
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
    return !!localStorage.getItem('token');
  }
}; 