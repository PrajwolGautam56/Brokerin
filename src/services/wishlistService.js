import api from '../axiosConfig';
import logger from '../utils/logger';

export const wishlistService = {
  // Get user's wishlist
  get: async () => {
    try {
      const response = await api.get('/api/wishlist');
      logger.log('Wishlist fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching wishlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch wishlist';
      throw new Error(errorMessage);
    }
  },

  // Add item to wishlist
  add: async (furnitureId) => {
    try {
      const response = await api.post('/api/wishlist/add', {
        furniture_id: furnitureId
      });
      logger.log('Added to wishlist:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error adding to wishlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
      throw new Error(errorMessage);
    }
  },

  // Remove item from wishlist
  remove: async (furnitureId) => {
    try {
      const response = await api.delete(`/api/wishlist/remove/${furnitureId}`);
      logger.log('Removed from wishlist:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error removing from wishlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
      throw new Error(errorMessage);
    }
  },

  // Clear entire wishlist
  clear: async () => {
    try {
      const response = await api.delete('/api/wishlist/clear');
      logger.log('Wishlist cleared:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error clearing wishlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to clear wishlist';
      throw new Error(errorMessage);
    }
  },

  // Move item from wishlist to cart
  moveToCart: async (furnitureId, quantity = 1) => {
    try {
      const response = await api.post('/api/wishlist/move-to-cart', {
        furniture_id: furnitureId,
        quantity
      });
      logger.log('Moved to cart:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error moving to cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to move to cart';
      throw new Error(errorMessage);
    }
  }
};

export default wishlistService;

