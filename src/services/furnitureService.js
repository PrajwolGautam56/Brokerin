import api from '../axiosConfig';

export const furnitureService = {
  // Helper to get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3030';
    return `${baseURL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  },

  // Get all furniture with optional filters
  getAllFurniture: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const url = `/api/furniture?${params}`;
      console.log('API Request URL:', url);
      console.log('Query parameters:', filters);
      const response = await api.get(url);
      console.log('API Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching furniture:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: 'Failed to fetch furniture' };
    }
  },

  getFurnitureById: async (id) => {
    try {
      const response = await api.get(`/api/furniture/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching furniture details:', error);
      throw error.response?.data || { message: 'Failed to fetch furniture details' };
    }
  },

  // Admin: Add furniture
  addFurniture: async (formData) => {
    try {
      const response = await api.post('/api/furniture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding furniture:', error);
      throw error.response?.data || { message: 'Failed to add furniture' };
    }
  },

  // Admin: Update furniture
  updateFurniture: async (id, formData) => {
    try {
      const response = await api.put(`/api/furniture/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating furniture:', error);
      throw error.response?.data || { message: 'Failed to update furniture' };
    }
  },

  // Admin: Delete furniture
  deleteFurniture: async (id) => {
    try {
      const response = await api.delete(`/api/furniture/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting furniture:', error);
      throw error.response?.data || { message: 'Failed to delete furniture' };
    }
  },

  // Admin: Update status
  updateFurnitureStatus: async (id, status, availability) => {
    try {
      const response = await api.patch(`/api/furniture/${id}/status`, {
        status,
        availability
      });
      return response.data;
    } catch (error) {
      console.error('Error updating furniture status:', error);
      throw error.response?.data || { message: 'Failed to update furniture status' };
    }
  },

  // Submit furniture request (for rental/purchase inquiries)
  submitFurnitureRequest: async (requestData) => {
    try {
      // Backend expects furniture_id, name, email, phoneNumber, message
      const requestPayload = {
        furniture_id: requestData.furniture_id,
        user_id: requestData.userId,
        name: requestData.name,
        email: requestData.email,
        phoneNumber: requestData.phone,
        message: requestData.message
      };
      
      // Add optional fields if present
      if (requestData.type) {
        requestPayload.listing_type = requestData.type === 'buy' ? 'Sell' : 'Rent';
      }
      if (requestData.address) {
        requestPayload.address = requestData.address;
      }
      if (requestData.duration) {
        requestPayload.rental_duration = requestData.duration;
      }
      if (requestData.preferred_date) {
        requestPayload.preferred_date = requestData.preferred_date;
      }
      if (requestData.preferred_time) {
        requestPayload.preferred_time = requestData.preferred_time;
      }
      
      console.log('Submitting furniture request:', requestPayload);
      const response = await api.post('/api/furniture-forms', requestPayload);
      console.log('Furniture request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting furniture request:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: 'Failed to submit furniture request' };
    }
  },

  // Admin: Get all furniture requests
  getAllFurnitureRequests: async () => {
    try {
      const response = await api.get('/api/furniture-forms');
      // Backend returns { success: true, data: [...], pagination: {...} }
      const requests = response.data.data || response.data;
      return Array.isArray(requests) ? { requests } : { requests: [] };
    } catch (error) {
      console.error('Error fetching furniture requests:', error);
      throw error.response?.data || { message: 'Failed to fetch furniture requests' };
    }
  },

  // Admin: Update furniture request
  updateFurnitureRequest: async (id, requestData) => {
    try {
      // If updating status, use status endpoint
      if (requestData.status) {
        const response = await api.patch(`/api/furniture-forms/${id}/status`, requestData);
        return response.data;
      }
      // Otherwise, use general update endpoint
      const response = await api.put(`/api/furniture-forms/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating furniture request:', error);
      throw error.response?.data || { message: 'Failed to update furniture request' };
    }
  },

  // Admin: Delete furniture request
  deleteFurnitureRequest: async (id) => {
    try {
      const response = await api.delete(`/api/furniture-forms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting furniture request:', error);
      throw error.response?.data || { message: 'Failed to delete furniture request' };
    }
  }
};

