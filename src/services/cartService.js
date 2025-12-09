import api from '../axiosConfig';
import logger from '../utils/logger';

export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/api/cart');
      logger.log('Cart fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch cart';
      throw new Error(errorMessage);
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, mode = 'rent') => {
    try {
      const response = await api.post('/api/cart/add', {
        product_id: productId,
        quantity,
        listing_type: mode === 'buy' ? 'Sell' : 'Rent'
      });
      logger.log('Added to cart:', response.data);
      return response.data;
    } catch (error) {
      // Extract detailed error information from backend
      const errorData = error.response?.data;
      
      // Log full error for debugging
      logger.error('Add to cart error:', {
        status: error.response?.status,
        message: errorData?.message,
        availability: errorData?.availability,
        status: errorData?.status,
        listing_type: errorData?.listing_type,
        available_stock: errorData?.available_stock,
        requested_quantity: quantity,
        suggestion: errorData?.suggestion,
        product_id: errorData?.product_id,
        product_name: errorData?.product_name
      });
      
      // Create enhanced error with details
      const errorMessage = errorData?.message || 'Failed to add to cart';
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.details = errorData; // Add details for frontend to use
      
      throw enhancedError;
    }
  },

  // Update cart item quantity
  updateItem: async (productId, quantity) => {
    try {
      const response = await api.put('/api/cart/update', {
        product_id: productId,
        quantity
      });
      logger.log('Cart item updated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update item';
      throw new Error(errorMessage);
    }
  },

  // Remove item from cart
  removeItem: async (productId) => {
    try {
      logger.log('Removing item from cart, productId:', productId);
      const response = await api.delete(`/api/cart/remove/${productId}`);
      logger.log('Cart item removed:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error removing cart item:', error);
      logger.error('Product ID:', productId);
      logger.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to remove item';
      throw new Error(errorMessage);
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/api/cart/clear');
      logger.log('Cart cleared:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to clear cart';
      throw new Error(errorMessage);
    }
  },

  // Update delivery charge
  updateDeliveryCharge: async (charge) => {
    try {
      const response = await api.put('/api/cart/delivery-charge', {
        delivery_charge: charge
      });
      logger.log('Delivery charge updated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating delivery charge:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update delivery charge';
      throw new Error(errorMessage);
    }
  },

  // Checkout
  checkout: async (data) => {
    try {
      const response = await api.post('/api/cart/checkout', data, {
        timeout: 90000 // 90 seconds for checkout
      });
      logger.log('Checkout successful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error during checkout:', error);
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
        const timeoutError = new Error('Checkout is taking longer than expected. Please check your order history.');
        throw timeoutError;
      }
      
      throw error.response?.data || error;
    }
  }
};

export default cartService;

