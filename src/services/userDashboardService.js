import api from '../axiosConfig';
import logger from '../utils/logger';

// Get complete dashboard data
export const getDashboard = async () => {
  try {
    const response = await api.get('/api/users/dashboard/me');
    logger.log('Dashboard data fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    throw error.response?.data || { message: 'Failed to fetch dashboard' };
  }
};

// Get my rentals
export const getMyRentals = async () => {
  try {
    const response = await api.get('/api/rentals/my-rentals');
    logger.log('My rentals fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching rentals:', error);
    throw error.response?.data || { message: 'Failed to fetch rentals' };
  }
};

// Get my service bookings
export const getMyServiceBookings = async () => {
  try {
    const response = await api.get('/api/service-bookings/my-bookings');
    logger.log('Service bookings fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching service bookings:', error);
    throw error.response?.data || { message: 'Failed to fetch service bookings' };
  }
};

// Get pending/overdue payments
export const getPendingOverduePayments = async () => {
  try {
    const response = await api.get('/api/rentals/pending-overdue');
    logger.log('Pending/overdue payments fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching payments:', error);
    throw error.response?.data || { message: 'Failed to fetch payments' };
  }
};

// Get activity history
export const getActivityHistory = async () => {
  try {
    const response = await api.get('/api/users/profile/activity');
    logger.log('Activity history fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching activity:', error);
    throw error.response?.data || { message: 'Failed to fetch activity' };
  }
};

// Get user's own furniture requests
export const getMyFurnitureRequests = async () => {
  try {
    const response = await api.get('/api/furniture-forms/me');
    logger.log('Furniture requests fetched:', response.data);
    
    // Handle response structure: { success: true, data: [...], count: N }
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : [],
        count: response.data.count || 0,
        requests: Array.isArray(response.data.data) ? response.data.data : []
      };
    }
    
    // Fallback for different response structures
    return {
      success: true,
      data: response.data.data || response.data || [],
      count: response.data.count || (Array.isArray(response.data.data) ? response.data.data.length : 0),
      requests: response.data.data || response.data || []
    };
  } catch (error) {
    logger.error('Error fetching furniture requests:', error);
    // Return empty structure instead of throwing to prevent UI errors
    return {
      success: false,
      data: [],
      count: 0,
      requests: []
    };
  }
};

// Get property requests
export const getMyPropertyRequests = async () => {
  try {
    const response = await api.get('/api/property-requests');
    logger.log('Property requests fetched:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching property requests:', error);
    throw error.response?.data || { message: 'Failed to fetch property requests' };
  }
};

