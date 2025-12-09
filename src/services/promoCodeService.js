import api from '../axiosConfig';
import logger from '../utils/logger';

export const promoCodeService = {
  // Validate a promo code
  validate: async (code, orderAmount, listingType, categories) => {
    try {
      const response = await api.post('/api/promo-codes/validate', {
        code,
        order_amount: orderAmount,
        listing_type: listingType,
        categories
      });
      logger.log('Promo code validated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error validating promo code:', error);
      const errorMessage = error.response?.data?.message || 'Invalid promo code';
      throw new Error(errorMessage);
    }
  },

  // Apply a promo code to cart
  apply: async (code) => {
    try {
      const response = await api.post('/api/promo-codes/apply', { code });
      logger.log('Promo code applied:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error applying promo code:', error);
      const errorMessage = error.response?.data?.message || 'Failed to apply promo code';
      throw new Error(errorMessage);
    }
  },

  // Get all active promo codes (public)
  getActive: async () => {
    try {
      const response = await api.get('/api/promo-codes/active');
      logger.log('Active promo codes fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching active promo codes:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch promo codes';
      throw new Error(errorMessage);
    }
  }
};

export default promoCodeService;

