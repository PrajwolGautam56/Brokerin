import api from '../axiosConfig';
import logger from '../utils/logger';

export const orderService = {
  // Get all orders (Admin) - cart orders only
  getAllOrders: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.order_status) queryParams.append('order_status', filters.order_status);
      if (filters.customer_email) queryParams.append('customer_email', filters.customer_email);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/api/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching orders:', error);
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error.response?.data || { message: 'Failed to fetch order' };
    }
  },

  // Update order status (Admin)
  updateOrderStatus: async (orderId, orderStatus, deliveryDate = null, notes = null) => {
    try {
      const payload = { order_status: orderStatus };
      if (deliveryDate) payload.delivery_date = deliveryDate;
      if (notes) payload.notes = notes;
      
      const response = await api.put(`/api/orders/${orderId}/order-status`, payload);
      return response.data;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error.response?.data || { message: 'Failed to update order status' };
    }
  },

  // Quick action: Confirm order (Admin)
  confirmOrder: async (orderId) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/confirm`, {});
      return response.data;
    } catch (error) {
      logger.error('Error confirming order:', error);
      throw error.response?.data || { message: 'Failed to confirm order' };
    }
  },

  // Quick action: Mark as out for delivery (Admin)
  markOutForDelivery: async (orderId, deliveryDate = null) => {
    try {
      const payload = deliveryDate ? { delivery_date: deliveryDate } : {};
      const response = await api.post(`/api/orders/${orderId}/out-for-delivery`, payload);
      return response.data;
    } catch (error) {
      logger.error('Error marking order as out for delivery:', error);
      throw error.response?.data || { message: 'Failed to mark order as out for delivery' };
    }
  },

  // Quick action: Mark as delivered (Admin)
  markDelivered: async (orderId) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/delivered`, {});
      return response.data;
    } catch (error) {
      logger.error('Error marking order as delivered:', error);
      throw error.response?.data || { message: 'Failed to mark order as delivered' };
    }
  },

  // Delete order (Admin)
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting order:', error);
      throw error.response?.data || { message: 'Failed to delete order' };
    }
  },

  // Get order status statistics (Admin)
  getOrderStats: async () => {
    try {
      const response = await api.get('/api/orders/order-stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching order stats:', error);
      throw error.response?.data || { message: 'Failed to fetch order stats' };
    }
  }
};
