import api from '../axiosConfig';
import logger from '../utils/logger';

export const adminService = {
  // Dashboard Overview
  getDashboardOverview: async () => {
    try {
      const response = await api.get('/api/admin/dashboard/overview');
      return response.data;
    } catch (error) {
      logger.error('Error fetching dashboard overview:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      
      // Preserve the original error for better debugging
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch dashboard overview' };
    }
  },

  // Analytics Endpoints
  getRevenueAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/analytics/revenue', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching revenue analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch revenue analytics' };
    }
  },

  getUserAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/analytics/users', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching user analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch user analytics' };
    }
  },

  getPropertyAnalytics: async () => {
    try {
      const response = await api.get('/api/admin/analytics/properties');
      return response.data;
    } catch (error) {
      logger.error('Error fetching property analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch property analytics' };
    }
  },

  getFurnitureAnalytics: async () => {
    try {
      const response = await api.get('/api/admin/analytics/furniture');
      return response.data;
    } catch (error) {
      logger.error('Error fetching furniture analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch furniture analytics' };
    }
  },

  getServiceAnalytics: async () => {
    try {
      const response = await api.get('/api/admin/analytics/services');
      return response.data;
    } catch (error) {
      logger.error('Error fetching service analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch service analytics' };
    }
  },

  getRentalAnalytics: async () => {
    try {
      const response = await api.get('/api/admin/analytics/rentals');
      return response.data;
    } catch (error) {
      logger.error('Error fetching rental analytics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch rental analytics' };
    }
  },

  // Settings Endpoints
  getSettings: async () => {
    try {
      const response = await api.get('/api/admin/settings');
      return response.data;
    } catch (error) {
      logger.error('Error fetching settings:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to fetch settings' };
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put('/api/admin/settings', settings);
      return response.data;
    } catch (error) {
      logger.error('Error updating settings:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to update settings' };
    }
  },

  testEmail: async (emailData) => {
    try {
      const response = await api.post('/api/admin/settings/test-email', emailData);
      return response.data;
    } catch (error) {
      logger.error('Error testing email:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to test email' };
    }
  },

  testPayment: async (paymentData) => {
    try {
      const response = await api.post('/api/admin/settings/test-payment', paymentData);
      return response.data;
    } catch (error) {
      logger.error('Error testing payment:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      if (error.response) {
        throw error;
      }
      throw error.response?.data || { message: 'Failed to test payment' };
    }
  },
};

