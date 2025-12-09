import api from '../axiosConfig';
import logger from '../utils/logger';

export const orderService = {
  // Get user's orders
  getMyOrders: async (status = '', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await api.get(`/api/rentals/my-rentals?${params.toString()}`);
      logger.log('Orders fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching orders:', error);
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/rentals/${orderId}`);
      logger.log('Order fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error.response?.data || { message: 'Failed to fetch order details' };
    }
  },

  // Cancel an order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await api.put(`/api/rentals/${orderId}/order-status`, {
        order_status: 'Cancelled',
        notes: reason
      });
      logger.log('Order cancelled:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error.response?.data || { message: 'Failed to cancel order' };
    }
  },

  // Get order tracking info
  getOrderTracking: async (orderId) => {
    try {
      const response = await api.get(`/api/rentals/${orderId}/tracking`);
      logger.log('Order tracking fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching order tracking:', error);
      throw error.response?.data || { message: 'Failed to fetch tracking info' };
    }
  }
};

export default orderService;

