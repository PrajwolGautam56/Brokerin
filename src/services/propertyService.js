import api from '../axiosConfig';

// Default coordinates (12°48'47.3"N 77°30'22.2"E in decimal degrees)
const DEFAULT_COORDINATES = {
  latitude: 12.813139,
  longitude: 77.506167
};

export const propertyService = {
  getAllProperties: async () => {
    try {
      const response = await api.get('/api/properties');
      console.log('API Response in service:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error.response?.data || { message: 'Failed to fetch properties' };
    }
  },

  getPropertyById: async (id) => {
    try {
      console.log(`Fetching property with ID: ${id}`);
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property details:', error);
      
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
      console.log('Creating property with form data');
      
      // Add authorization header
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the final form data being sent
      console.log('Final form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Use the correct endpoint
      const response = await api.post('/properties/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Log the complete response for debugging
      console.log('Complete API response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log('Property creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createProperty:', error);
      
      // Log the complete error object
      console.error('Complete error object:', {
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
      console.log(`Updating property with ID: ${id}`);
      console.log('Request data:', JSON.stringify(propertyData, null, 2));

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
        console.log('PATCH request failed, trying PUT instead:', patchError);
        // If PATCH fails, try PUT as a fallback
        const putResponse = await api.put(`/api/properties/${id}`, propertyData);
        return putResponse.data;
      }
    } catch (error) {
      console.error('Error updating property:', error);
      
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
      console.error('Error deleting property:', error);
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
      const response = await api.post('/api/property-forms', {
        property_id: requestData.property_id,
        name: requestData.name,
        email: requestData.email,
        phoneNumber: requestData.phoneNumber,
        message: requestData.message
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting property request:', error);
      throw error.response?.data || { message: 'Failed to submit property request' };
    }
  },

  // Property CRUD operations
  getAllPropertyRequests: async () => {
    try {
      const response = await api.get('/api/property-forms');
      return response.data;
    } catch (error) {
      console.error('Error fetching property requests:', error);
      throw error.response?.data || { message: 'Failed to fetch property requests' };
    }
  },

  updatePropertyRequest: async (id, requestData) => {
    try {
      const response = await api.patch(`/api/property-forms/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating property request:', error);
      throw error.response?.data || { message: 'Failed to update property request' };
    }
  },

  deletePropertyRequest: async (id) => {
    try {
      const response = await api.delete(`/api/property-forms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property request:', error);
      throw error.response?.data || { message: 'Failed to delete property request' };
    }
  },

  checkPropertyExists: async (id) => {
    try {
      console.log(`Checking if property with ID ${id} exists`);
      const response = await api.head(`/api/properties/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error(`Property with ID ${id} does not exist:`, error);
      return false;
    }
  }
}; 