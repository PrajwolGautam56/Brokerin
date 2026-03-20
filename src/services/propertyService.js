import api from '../axiosConfig';

import logger from '../utils/logger';

export const propertyService = {
  getAllProperties: async () => {
    try {
      const response = await api.get('/api/properties');
      logger.log('API Response in service:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching properties:', error);
      throw error.response?.data || { message: 'Failed to fetch properties' };
    }
  },

  getPropertyById: async (id) => {
    try {
      logger.log(`Fetching property with ID: ${id}`);
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching property details:', error);
      
      // Create a more detailed error object
      const errorObj = {
        message: 'Failed to fetch property details',
        status: error.response?.status,
        details: error.response?.data
      };
      
      if (error.response?.status === 404) {
        errorObj.message = `Property with ID ${id} not found`;
      } else if (error.response?.data?.message) {
        errorObj.message = error.response.data.message;
      }
      
      throw errorObj;
    }
  },

  createProperty: async (formData) => {
    try {
      logger.log('Creating property with form data');
      
      // Add authorization header
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the final form data being sent
      logger.log('Final form data being sent:');
      for (let [key, value] of formData.entries()) {
        logger.log(`${key}: ${value}`);
      }

      // Use the correct endpoint
      const response = await api.post('/api/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Log the complete response for debugging
      logger.log('Complete API response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      logger.log('Property creation successful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error in createProperty:', error);
      
      // Log the complete error object
      logger.error('Complete error object:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Create a detailed error object
      const errorObj = {
        message: 'Failed to create property',
        status: error.response?.status,
        details: error.response?.data,
        error: error.message
      };
      
      if (error.response?.status === 400) {
        const errorDetails = error.response.data;
        if (errorDetails.message) {
          errorObj.message = errorDetails.message;
        } else if (errorDetails.errors) {
          errorObj.message = Object.values(errorDetails.errors).join(', ');
        } else {
          errorObj.message = 'Invalid data provided. Please check all fields.';
        }
      } else if (error.response?.status === 404) {
        errorObj.message = 'API endpoint not found. Please check the server configuration.';
      } else if (error.response?.status === 500) {
        errorObj.message = 'Server error occurred while creating property. Please try again later.';
      } else if (error.response?.data?.message) {
        errorObj.message = error.response.data.message;
      } else if (error.message === 'No authentication token found') {
        errorObj.message = 'Please log in to create a property';
      } else if (error.message === 'No data received from server') {
        errorObj.message = 'Server did not return any data. Please try again.';
      }
      
      throw errorObj;
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      // Log the request details for debugging
      logger.log(`Updating property with ID: ${id}`);
      logger.log('Request data:', JSON.stringify(propertyData, null, 2));

      // Handle amenities conversion if it's a string
      if (propertyData.amenities && typeof propertyData.amenities === 'string') {
        propertyData.amenities = propertyData.amenities.split(',').map(item => item.trim());
      }

      // Ensure numbers are properly formatted
      if (propertyData.price) {
        Object.keys(propertyData.price).forEach(key => {
          if (propertyData.price[key]) {
            propertyData.price[key] = Number(propertyData.price[key]);
          }
        });
      }

      // Remove any null or undefined values
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === null || propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      // Try using PUT instead of PATCH if the backend doesn't support PATCH properly
      // Some REST APIs prefer PUT for full updates
      try {
        const response = await api.patch(`/api/properties/${id}`, propertyData);
        return response.data;
      } catch (patchError) {
        logger.log('PATCH request failed, trying PUT instead:', patchError);
        // If PATCH fails, try PUT as a fallback
        const putResponse = await api.put(`/api/properties/${id}`, propertyData);
        return putResponse.data;
      }
    } catch (error) {
      logger.error('Error updating property:', error);
      
      // Create a more detailed error object
      const errorObj = {
        message: 'Failed to update property',
        status: error.response?.status,
        details: error.response?.data
      };
      
      if (error.response?.status === 404) {
        errorObj.message = `Property with ID ${id} not found`;
      } else if (error.response?.data?.message) {
        errorObj.message = error.response.data.message;
      }
      
      throw errorObj;
    }
  },

  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting property:', error);
      throw error.response?.data || { message: 'Failed to delete property' };
    }
  },

  formatAmenities: (amenitiesString) => {
    if (!amenitiesString) return [];
    try {
      if (Array.isArray(amenitiesString)) {
        return amenitiesString[0].replace(/"/g, '').split(',').map(item => item.trim());
      }
      return amenitiesString.replace(/"/g, '').split(',').map(item => item.trim());
    } catch (error) {
      return [];
    }
  },

  getImageUrl: (photoUrl) => {
    if (!photoUrl) return null;
    return photoUrl;
  },

  submitPropertyRequest: async (requestData) => {
    try {
      logger.log('Submitting property request to API:', requestData);
      logger.log('Property ID being sent:', requestData.property_id);
      
      // Use extended timeout for property form submissions (server processing can be slow)
      const response = await api.post('/api/property-forms', {
        property_id: requestData.property_id,
        name: requestData.name,
        email: requestData.email,
        phoneNumber: requestData.phoneNumber,
        message: requestData.message
      }, {
        timeout: 90000 // 90 seconds for property form submissions
      });
      
      logger.log('Property request response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error submitting property request:', error);
      logger.error('Error response:', error.response?.data);
      logger.error('Error status:', error.response?.status);
      logger.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle timeout specifically
      if (error.isTimeout || error.code === 'TIMEOUT' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timed out. The server is taking longer than expected. Please check your connection and try again.');
      }
      
      // Handle network errors
      if (error.isNetworkError || error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Create a detailed error message
      let errorMessage = error.response?.data?.message || error.message || 'Failed to submit property request';
      
      // If it's a property not found error, provide helpful message
      if (error.response?.status === 404 || errorMessage.toLowerCase().includes('property')) {
        errorMessage = 'Property not found. Please try refreshing the page.';
      }
      
      throw new Error(errorMessage);
    }
  },

  // Property CRUD operations
  getAllPropertyRequests: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/property-forms${queryParams ? '?' + queryParams : ''}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching property requests:', error);
      throw error.response?.data || { message: 'Failed to fetch property requests' };
    }
  },

  updatePropertyRequest: async (id, requestData) => {
    try {
      // If updating status, use the status endpoint
      if (requestData.status) {
        const response = await api.patch(`/api/property-forms/${id}/status`, requestData);
        return response.data;
      }
      // Otherwise, use the general update endpoint
      const response = await api.put(`/api/property-forms/${id}`, requestData);
      return response.data;
    } catch (error) {
      logger.error('Error updating property request:', error);
      throw error.response?.data || { message: 'Failed to update property request' };
    }
  },

  deletePropertyRequest: async (id) => {
    try {
      const response = await api.delete(`/api/property-forms/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting property request:', error);
      throw error.response?.data || { message: 'Failed to delete property request' };
    }
  },

  checkPropertyExists: async (id) => {
    try {
      logger.log(`Checking if property with ID ${id} exists`);
      await api.get(`/api/properties/${id}`);
      return true;
    } catch (error) {
      logger.error(`Property with ID ${id} does not exist:`, error);
      return false;
    }
  }
}; 