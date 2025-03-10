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
      
      // Add default coordinates to each property
      if (response.data && Array.isArray(response.data.properties)) {
        response.data.properties = response.data.properties.map(property => ({
          ...property,
          location_coordinates: DEFAULT_COORDINATES
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error.response?.data || { message: 'Failed to fetch properties' };
    }
  },

  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/api/properties/${id}`);
      // Add default coordinates to the property
      return {
        ...response.data,
        location_coordinates: DEFAULT_COORDINATES
      };
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error.response?.data || { message: 'Failed to fetch property details' };
    }
  },

  formatAmenities: (amenitiesString) => {
    try {
      // Remove quotes and split by comma
      return amenitiesString.replace(/"/g, '').split(',').map(item => item.trim());
    } catch (error) {
      return [];
    }
  },

  getImageUrl: (photoFilename) => {
    if (!photoFilename) return null;
    return `${photoFilename}`;
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

  submitServiceBooking: async (bookingData) => {
    try {
      const response = await api.post('/api/service-bookings', {
        service_type: bookingData.service_type,
        name: bookingData.name,
        phone_number: bookingData.phone_number,
        preferred_date: bookingData.preferred_date,
        preferred_time: bookingData.preferred_time,
        service_address: bookingData.service_address,
        additional_notes: bookingData.additional_notes
      });
      
      console.log('Service booking response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting service booking:', error);
      throw error.response?.data || { message: 'Failed to submit service booking' };
    }
  },

  submitContactForm: async (contactData) => {
    try {
      const response = await api.post('/api/contacts', {
        fullname: contactData.name,
        email: contactData.email,
        phonenumber: contactData.phone,
        subject: contactData.subject,
        message: contactData.message
      });
      
      console.log('Contact form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error.response?.data || { message: 'Failed to submit contact form' };
    }
  }
}; 