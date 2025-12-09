import api from '../axiosConfig';
import logger from '../utils/logger';

export const reviewService = {
  // Get reviews for a furniture item
  getFurnitureReviews: async (furnitureId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/api/reviews/furniture/${furnitureId}?page=${page}&limit=${limit}`);
      logger.log('Reviews fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching reviews:', error);
      throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
  },

  // Create a new review
  createReview: async (data) => {
    try {
      const response = await api.post('/api/reviews', data);
      logger.log('Review created:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error.response?.data || { message: 'Failed to create review' };
    }
  },

  // Update an existing review
  updateReview: async (reviewId, data) => {
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, data);
      logger.log('Review updated:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error.response?.data || { message: 'Failed to update review' };
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      logger.log('Review deleted:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error.response?.data || { message: 'Failed to delete review' };
    }
  },

  // Mark a review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/api/reviews/${reviewId}/helpful`);
      logger.log('Review marked helpful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error marking review helpful:', error);
      throw error.response?.data || { message: 'Failed to mark review as helpful' };
    }
  },

  // Get user's own reviews
  getMyReviews: async () => {
    try {
      const response = await api.get('/api/reviews/my-reviews');
      logger.log('My reviews fetched:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error fetching my reviews:', error);
      throw error.response?.data || { message: 'Failed to fetch your reviews' };
    }
  }
};

export default reviewService;

