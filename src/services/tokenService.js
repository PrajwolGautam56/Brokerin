/**
 * Token Service
 * Manages JWT access tokens and refresh tokens
 * Access tokens expire after 24 hours
 * Refresh tokens expire after 30 days
 */

class TokenService {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'token';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
  }

  /**
   * Get access token from storage
   */
  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set both access and refresh tokens
   */
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if access token is expired or about to expire
   * Returns true if token expires in less than 1 hour
   */
  isTokenExpiringSoon(token = null) {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return true;

    try {
      // Decode JWT payload (without verification)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Token expires in less than 1 hour
      return timeUntilExpiry < 60 * 60 * 1000;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // If we can't decode, assume it's expired
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token = null) {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3030'}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Token refresh failed');
      }

      const data = await response.json();
      
      // Token rotation - update both tokens
      this.setTokens(data.token, data.refreshToken);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens if refresh fails
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  isAuthenticated() {
    const accessToken = this.getAccessToken();
    return !!accessToken && !this.isTokenExpired(accessToken);
  }
}

// Export singleton instance
export const tokenService = new TokenService();
export default tokenService;

