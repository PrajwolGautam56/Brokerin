import api from '../axiosConfig';

import logger from '../utils/logger';
export const rentalService = {
  // Get all rentals (Admin)
  getAllRentals: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.order_status) queryParams.append('order_status', filters.order_status);
      if (filters.order_source) queryParams.append('order_source', filters.order_source);
      if (filters.exclude_order_source) queryParams.append('exclude_order_source', filters.exclude_order_source);
      if (filters.customer_email) queryParams.append('customer_email', filters.customer_email);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/api/rentals${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      // API returns: { success: true, data: [...] } or { data: [...] }
      return response.data;
    } catch (error) {
      logger.error('Error fetching rentals:', error);
      throw error.response?.data || { message: 'Failed to fetch rentals' };
    }
  },

  // Get rental by ID
  getRentalById: async (id) => {
    try {
      const response = await api.get(`/api/rentals/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching rental:', error);
      throw error.response?.data || { message: 'Failed to fetch rental' };
    }
  },

  // Create rental (Admin)
  createRental: async (rentalData) => {
    try {
      const response = await api.post('/api/rentals', rentalData);
      return response.data;
    } catch (error) {
      logger.error('Error creating rental:', error);
      throw error.response?.data || { message: 'Failed to create rental' };
    }
  },

  // Update rental (Admin)
  updateRental: async (id, rentalData) => {
    try {
      const response = await api.put(`/api/rentals/${id}`, rentalData);
      return response.data;
    } catch (error) {
      logger.error('Error updating rental:', error);
      throw error.response?.data || { message: 'Failed to update rental' };
    }
  },

  // Delete rental (Admin)
  deleteRental: async (id) => {
    try {
      const response = await api.delete(`/api/rentals/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting rental:', error);
      throw error.response?.data || { message: 'Failed to delete rental' };
    }
  },

  // Get user's rentals (by email or user ID)
  getMyRentals: async () => {
    try {
      const response = await api.get('/api/rentals/my-rentals');
      // API returns: { success: true, data: [...] }
      return response.data;
    } catch (error) {
      logger.error('Error fetching my rentals:', error);
      throw error.response?.data || { message: 'Failed to fetch my rentals' };
    }
  },

  // Add payment record (Admin)
  addPaymentRecord: async (rentalId, paymentData) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      logger.error('Error adding payment record:', error);
      throw error.response?.data || { message: 'Failed to add payment record' };
    }
  },

  // Update payment record (Admin)
  updatePaymentRecord: async (rentalId, paymentId, paymentData) => {
    try {
      const response = await api.put(`/api/rentals/${rentalId}/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      logger.error('Error updating payment record:', error);
      throw error.response?.data || { message: 'Failed to update payment record' };
    }
  },

  // Generate payment records manually (Admin) - Note: System auto-generates records daily
  // This is for manual override if needed. Records are automatically created for:
  // - Past due months
  // - Current month
  // - Next month (1 month ahead)
  generatePaymentRecords: async (rentalId, months = 3) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/payments/generate`, { months });
      return response.data;
    } catch (error) {
      logger.error('Error generating payment records:', error);
      throw error.response?.data || { message: 'Failed to generate payment records' };
    }
  },

  // Send payment reminders for a rental (Admin)
  sendReminders: async (rentalId, paymentLink = null) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/send-reminders`, {
        ...(paymentLink && { paymentLink })
      });
      return response.data;
    } catch (error) {
      logger.error('Error sending reminders:', error);
      throw error.response?.data || { message: 'Failed to send reminders' };
    }
  },

  // Get pending/overdue payments only
  getPendingOverduePayments: async () => {
    try {
      const response = await api.get('/api/rentals/pending-overdue');
      return response.data;
    } catch (error) {
      logger.error('Error fetching pending/overdue payments:', error);
      throw error.response?.data || { message: 'Failed to fetch pending/overdue payments' };
    }
  },

  // Get rental dashboard (Admin)
  getRentalDashboard: async () => {
    try {
      const response = await api.get('/api/rentals/dashboard');
      return response.data;
    } catch (error) {
      logger.error('Error fetching rental dashboard:', error);
      throw error.response?.data || { message: 'Failed to fetch rental dashboard' };
    }
  },

  // Get dues breakdown (Admin)
  getDuesBreakdown: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.customer_email) queryParams.append('customer_email', filters.customer_email);

      const response = await api.get(`/api/rentals/dues-breakdown${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching dues breakdown:', error);
      throw error.response?.data || { message: 'Failed to fetch dues breakdown' };
    }
  },

  // Get monthly collection (Admin)
  getMonthlyCollection: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);

      const response = await api.get(`/api/rentals/monthly-collection${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching monthly collection:', error);
      throw error.response?.data || { message: 'Failed to fetch monthly collection' };
    }
  },

  // Get monthly collection details for specific month (Admin)
  getMonthlyCollectionDetails: async (month) => {
    try {
      const response = await api.get(`/api/rentals/monthly-collection/${month}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching monthly collection details:', error);
      throw error.response?.data || { message: 'Failed to fetch monthly collection details' };
    }
  },

  // Delete payment record (Admin)
  deletePaymentRecord: async (rentalId, paymentId) => {
    try {
      const response = await api.delete(`/api/rentals/${rentalId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting payment record:', error);
      throw error.response?.data || { message: 'Failed to delete payment record' };
    }
  },

  // Send reminder for specific month (Admin)
  sendReminderForMonth: async (rentalId, paymentId) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/payments/${paymentId}/send-reminder`, {});
      return response.data;
    } catch (error) {
      logger.error('Error sending reminder for month:', error);
      throw error.response?.data || { message: 'Failed to send reminder' };
    }
  },

  // Get order status statistics (Admin)
  getOrderStats: async () => {
    try {
      const response = await api.get('/api/rentals/order-stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching order stats:', error);
      throw error.response?.data || { message: 'Failed to fetch order stats' };
    }
  },

  // Update order status (Admin)
  updateOrderStatus: async (rentalId, orderStatus, deliveryDate = null, notes = null) => {
    try {
      const payload = { order_status: orderStatus };
      if (deliveryDate) payload.delivery_date = deliveryDate;
      if (notes) payload.notes = notes;
      
      const response = await api.put(`/api/rentals/${rentalId}/order-status`, payload);
      return response.data;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error.response?.data || { message: 'Failed to update order status' };
    }
  },

  // Quick action: Confirm order (Admin)
  confirmOrder: async (rentalId) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/confirm`, {});
      return response.data;
    } catch (error) {
      logger.error('Error confirming order:', error);
      throw error.response?.data || { message: 'Failed to confirm order' };
    }
  },

  // Quick action: Mark as out for delivery (Admin)
  markOutForDelivery: async (rentalId, deliveryDate = null) => {
    try {
      const payload = deliveryDate ? { delivery_date: deliveryDate } : {};
      const response = await api.post(`/api/rentals/${rentalId}/out-for-delivery`, payload);
      return response.data;
    } catch (error) {
      logger.error('Error marking order as out for delivery:', error);
      throw error.response?.data || { message: 'Failed to mark order as out for delivery' };
    }
  },

  // Quick action: Mark as delivered (Admin)
  markDelivered: async (rentalId) => {
    try {
      const response = await api.post(`/api/rentals/${rentalId}/delivered`, {});
      return response.data;
    } catch (error) {
      logger.error('Error marking order as delivered:', error);
      throw error.response?.data || { message: 'Failed to mark order as delivered' };
    }
  }
};

