import api from '../axiosConfig';
import logger from '../utils/logger';

export const stockService = {
  // Update single product stock
  updateStock: async (furnitureId, stock, operation = 'set') => {
    try {
      const response = await api.put(`/api/furniture/${furnitureId}/stock`, {
        stock,
        operation
      });
      logger.log('Stock updated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating stock:', error);
      logger.error('Error response:', error.response?.data);
      logger.error('Error status:', error.response?.status);
      
      // Create proper error object
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update stock';
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.details = error.response?.data;
      
      throw enhancedError;
    }
  },

  // Get low stock items
  getLowStockItems: async (threshold = 5) => {
    try {
      const response = await api.get(`/api/furniture/low-stock?threshold=${threshold}`);
      logger.log('Low stock items:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching low stock items:', error);
      throw error.response?.data || { message: 'Failed to fetch low stock items' };
    }
  },

  // Get out of stock items
  getOutOfStockItems: async () => {
    try {
      const response = await api.get('/api/furniture/out-of-stock');
      logger.log('Out of stock items:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching out of stock items:', error);
      throw error.response?.data || { message: 'Failed to fetch out of stock items' };
    }
  },

  // Bulk stock update
  bulkUpdateStock: async (updates) => {
    try {
      const response = await api.post('/api/furniture/bulk-stock-update', {
        updates
      });
      logger.log('Bulk stock update:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error bulk updating stock:', error);
      throw error.response?.data || { message: 'Failed to bulk update stock' };
    }
  },

  // Get stock statistics
  getStockStats: async () => {
    try {
      const response = await api.get('/api/furniture/stock-stats');
      logger.log('Stock stats:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching stock stats:', error);
      throw error.response?.data || { message: 'Failed to fetch stock statistics' };
    }
  }
};

export default stockService;

