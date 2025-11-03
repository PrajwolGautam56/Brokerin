import axios from 'axios';
import { tokenService } from './services/tokenService';

// Create axios instance with configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3030',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 second timeout for local development
});

// Log configuration on startup
console.log('API Configuration:', {
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // If FormData is detected, remove Content-Type header
    // Let the browser set it automatically with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('FormData detected - Content-Type will be set automatically');
    }

    // Log each request
    console.log('Making request:', {
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
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Log error responses
      console.error('API Error Response:', {
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
          console.log('Access token expired, attempting refresh...');
          // Try to refresh the access token
          const newAccessToken = await tokenService.refreshAccessToken();
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          console.log('Token refreshed successfully, retrying original request');
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Refresh failed - clear tokens and redirect to login
          tokenService.clearTokens();
          localStorage.removeItem('user');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // Handle other error cases
      switch (error.response.status) {
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Other error:', error.response.status);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 