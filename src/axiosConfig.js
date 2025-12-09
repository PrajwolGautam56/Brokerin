import axios from 'axios';
import { tokenService } from './services/tokenService';
import logger from './utils/logger';

// Create axios instance with configuration
// Use longer timeout in production (60s) vs development (30s)
const isProduction = process.env.NODE_ENV === 'production';

// In development, use empty baseURL to leverage proxy in package.json
// In production, use REACT_APP_API_BASE_URL from environment variables
const baseURL = process.env.REACT_APP_API_BASE_URL || (isProduction ? '' : '');

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: isProduction ? 60000 : 30000, // 60s for production, 30s for development
});

// Log configuration on startup (development only)
logger.log('API Configuration:', {
  baseURL: baseURL || 'Using proxy from package.json',
  timeout: isProduction ? 60000 : 30000,
  environment: process.env.NODE_ENV
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // If FormData is detected, remove Content-Type header
    // Let the browser set it automatically with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      logger.log('FormData detected - Content-Type will be set automatically');
    }

    // Log each request (development only)
    logger.log('Making request:', {
      method: config.method,
      url: config.url,
      data: config.data instanceof FormData ? 'FormData object' : config.data,
      headers: config.headers
    });

    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses (development only)
    logger.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Log error responses (development only)
      logger.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.response.config.url,
        method: error.response.config.method
      });

      // Handle 401 Unauthorized - try to refresh token
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          logger.log('Access token expired, attempting refresh...');
          // Try to refresh the access token
          const newAccessToken = await tokenService.refreshAccessToken();
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          logger.log('Token refreshed successfully, retrying original request');
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          logger.error('Token refresh failed:', refreshError);
          // Refresh failed - clear tokens, stay on current page
          tokenService.clearTokens();
          localStorage.removeItem('user');
          
          // Don't redirect - user stays on current page and can use navbar login
          return Promise.reject(refreshError);
        }
      }

      // Handle other error cases
      switch (error.response.status) {
        case 403:
          logger.error('Forbidden access');
          break;
        case 404:
          logger.error('Resource not found');
          break;
        case 500:
          logger.error('Server error');
          break;
        default:
          logger.error('Other error:', error.response.status);
      }
    } else if (error.request) {
      logger.error('No response received:', error.request);
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = new Error('Request timed out. The server is taking longer than expected. Please try again.');
        timeoutError.code = 'TIMEOUT';
        timeoutError.isTimeout = true;
        return Promise.reject(timeoutError);
      }
      // Handle network errors
      const networkError = new Error('Network error. Please check your internet connection and try again.');
      networkError.code = 'NETWORK_ERROR';
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    } else {
      logger.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 