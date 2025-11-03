import api from '../axiosConfig';

const serviceBookingService = {
  // Create a service booking (PUBLIC - No auth required)
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/api/service-bookings', {
        service_type: bookingData.service_type,
        name: bookingData.name,
        phone_number: bookingData.phone_number,
        email: bookingData.email, // Optional
        preferred_date: bookingData.preferred_date,
        preferred_time: bookingData.preferred_time,
        alternate_date: bookingData.alternate_date, // Optional
        alternate_time: bookingData.alternate_time, // Optional
        service_address: bookingData.service_address,
        additional_notes: bookingData.additional_notes // Optional
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service booking:', error);
      throw error.response?.data || { message: 'Failed to create booking' };
    }
  },

  // Get all service bookings (ADMIN only)
  getAllBookings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.service_type) queryParams.append('service_type', filters.service_type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.phone_number) queryParams.append('phone_number', filters.phone_number);

      const response = await api.get(`/api/service-bookings${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Get booking by ID (ADMIN)
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/api/service-bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error.response?.data || { message: 'Failed to fetch booking' };
    }
  },

  // Update booking status (ADMIN)
  updateBookingStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/service-bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error.response?.data || { message: 'Failed to update booking status' };
    }
  },

  // Update booking time/date (ADMIN)
  updateBookingTime: async (id, timeData) => {
    try {
      const response = await api.put(`/api/service-bookings/${id}/time`, timeData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking time:', error);
      throw error.response?.data || { message: 'Failed to update booking time' };
    }
  },

  // Delete booking (ADMIN)
  deleteBooking: async (id) => {
    try {
      const response = await api.delete(`/api/service-bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error.response?.data || { message: 'Failed to delete booking' };
    }
  },

  // USER ENDPOINTS
  
  // Get own bookings (USER)
  getMyBookings: async () => {
    try {
      const response = await api.get('/api/service-bookings/my-bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Update own booking (USER)
  updateMyBooking: async (id, updateData) => {
    try {
      const response = await api.put(`/api/service-bookings/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error.response?.data || { message: 'Failed to update booking' };
    }
  },

  // Cancel own booking (USER)
  cancelMyBooking: async (id) => {
    try {
      const response = await api.put(`/api/service-bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  }
};

export default serviceBookingService;

