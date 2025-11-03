import api from '../axiosConfig';

export const furnitureService = {
  getAllFurniture: async () => {
    try {
      const response = await api.get('/api/furniture');
      return response.data;
    } catch (error) {
      console.error('Error fetching furniture:', error);
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

  submitFurnitureRequest: async (requestData) => {
    try {
      const response = await api.post('/api/furniture-requests', {
        furniture_id: requestData.furniture_id,
        type: requestData.type, // 'buy' or 'rent'
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone,
        address: requestData.address,
        duration: requestData.duration, // for rental
        message: requestData.message,
        preferred_date: requestData.preferred_date,
        preferred_time: requestData.preferred_time
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting furniture request:', error);
      throw error.response?.data || { message: 'Failed to submit furniture request' };
    }
  },

  // Admin functions
  getAllFurnitureRequests: async () => {
    try {
      const response = await api.get('/api/furniture-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching furniture requests:', error);
      throw error.response?.data || { message: 'Failed to fetch furniture requests' };
    }
  },

  updateFurnitureRequest: async (id, requestData) => {
    try {
      const response = await api.patch(`/api/furniture-requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating furniture request:', error);
      throw error.response?.data || { message: 'Failed to update furniture request' };
    }
  },

  deleteFurnitureRequest: async (id) => {
    try {
      const response = await api.delete(`/api/furniture-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting furniture request:', error);
      throw error.response?.data || { message: 'Failed to delete furniture request' };
    }
  }
};

