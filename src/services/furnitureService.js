import api from '../axiosConfig';

import logger from '../utils/logger';
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
      logger.log('API Request URL:', url);
      logger.log('Query parameters:', filters);
      const response = await api.get(url);
      logger.log('API Response data:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching furniture:', error);
      logger.error('Error response:', error.response?.data);
      throw error.response?.data || { message: 'Failed to fetch furniture' };
    }
  },

  getFurnitureById: async (id) => {
    try {
      const response = await api.get(`/api/furniture/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching furniture details:', error);
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
      logger.error('Error adding furniture:', error);
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
      logger.error('Error updating furniture:', error);
      throw error.response?.data || { message: 'Failed to update furniture' };
    }
  },

  // Admin: Delete furniture
  deleteFurniture: async (id) => {
    try {
      const response = await api.delete(`/api/furniture/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting furniture:', error);
      throw error.response?.data || { message: 'Failed to delete furniture' };
    }
  },

  // Admin: Update status (Quick update)
  updateFurnitureStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/api/furniture/${id}/status`, {
        status: statusData.status,
        availability: statusData.availability
      });
      logger.log('Furniture status updated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating furniture status:', error);
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
      
      logger.log('Submitting furniture request:', requestPayload);
      // Use extended timeout for furniture form submissions (server processing can be slow)
      const response = await api.post('/api/furniture-forms', requestPayload, {
        timeout: 90000 // 90 seconds for furniture form submissions
      });
      logger.log('Furniture request response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error submitting furniture request:', error);
      logger.error('Error response:', error.response?.data);
      
      // Handle timeout specifically
      if (error.isTimeout || error.code === 'TIMEOUT' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = { message: 'Request timed out. The server is taking longer than expected. Please check your connection and try again.' };
        throw timeoutError;
      }
      
      // Handle network errors
      if (error.isNetworkError || error.code === 'NETWORK_ERROR') {
        const networkError = { message: 'Network error. Please check your internet connection and try again.' };
        throw networkError;
      }
      
      throw error.response?.data || { message: 'Failed to submit furniture request' };
    }
  },

  // Admin: Get all furniture requests
  getAllFurnitureRequests: async () => {
    try {
      const response = await api.get('/api/furniture-forms');
      logger.log('Raw furniture requests API response:', response.data);
      
      // Backend returns { success: true, data: [...], pagination: {...}, validStatuses: [...] }
      const requests = response.data.data || response.data;
      const result = Array.isArray(requests) ? { requests } : { requests: [] };
      
      // Include validStatuses if provided by backend
      if (response.data.validStatuses) {
        result.validStatuses = response.data.validStatuses;
      }
      
      // Also check if validStatuses is at root level
      if (response.data.validStatuses === undefined && response.validStatuses) {
        result.validStatuses = response.validStatuses;
      }
      
      logger.log('Processed furniture requests result:', result);
      return result;
    } catch (error) {
      logger.error('Error fetching furniture requests:', error);
      throw error.response?.data || { message: 'Failed to fetch furniture requests' };
    }
  },

  // Admin: Update furniture request
  updateFurnitureRequest: async (id, requestData) => {
    try {
      // If updating status, payment_status, or scheduled_delivery_date, use status endpoint with PATCH
      if (requestData.status || requestData.payment_status || requestData.scheduled_delivery_date) {
        const response = await api.patch(`/api/furniture-forms/${id}/status`, requestData);
        return response.data;
      }
      // Otherwise, use general update endpoint
      const response = await api.put(`/api/furniture-forms/${id}`, requestData);
      return response.data;
    } catch (error) {
      logger.error('Error updating furniture request:', error);
      throw error.response?.data || { message: 'Failed to update furniture request' };
    }
  },

  // Admin: Delete furniture request
  deleteFurnitureRequest: async (id) => {
    try {
      const response = await api.delete(`/api/furniture-forms/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting furniture request:', error);
      throw error.response?.data || { message: 'Failed to delete furniture request' };
    }
  }
};

