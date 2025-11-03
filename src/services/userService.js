import api from '../axiosConfig';

export const userService = {
  // Get all users with filters and pagination
  getAllUsers: async (filters = {}) => {
    try {
      // Build query params - only include defined, non-empty values
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        // Skip undefined, null, or empty strings (unless it's a number like page/limit)
        if (value !== undefined && value !== null && value !== '') {
          // Convert boolean to string
          if (typeof value === 'boolean') {
            params.append(key, value.toString());
          } else {
            params.append(key, value);
          }
        }
      });
      
      const queryString = params.toString();
      const response = await api.get(`/api/users${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  // Get single user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  // Get user details with all submissions
  getUserDetails: async (id) => {
    try {
      const response = await api.get(`/api/users/details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error.response?.data || { message: 'Failed to fetch user details' };
    }
  },

  // Update user
  updateUser: async (id, updates) => {
    try {
      const response = await api.put(`/api/users/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error.response?.data || { message: 'Failed to update user' };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },

  // User: Get own profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/api/users/profile/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // User: Update own profile
  updateMyProfile: async (updates) => {
    try {
      const response = await api.put('/api/users/profile/me', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // User: Get own activity history
  getMyActivity: async () => {
    try {
      const response = await api.get('/api/users/profile/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error.response?.data || { message: 'Failed to fetch activity' };
    }
  },

  // User: Get own dashboard
  getMyDashboard: async () => {
    try {
      const response = await api.get('/api/users/dashboard/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error.response?.data || { message: 'Failed to fetch dashboard' };
    }
  }
};

