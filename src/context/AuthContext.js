import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef(null);

  /**
   * Stop token refresh scheduler
   */
  const stopTokenRefreshScheduler = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  /**
   * Start proactive token refresh scheduler
   * Checks every 30 minutes and refreshes if token expires in less than 1 hour
   */
  const startTokenRefreshScheduler = () => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const checkAndRefresh = async () => {
      // Only refresh if user is logged in
      if (!authService.isAuthenticated()) {
        stopTokenRefreshScheduler();
        return;
      }

      try {
        // Check if token is expiring soon
        if (tokenService.isTokenExpiringSoon()) {
          console.log('Token expiring soon, refreshing proactively...');
          await tokenService.refreshAccessToken();
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // If refresh fails, don't clear tokens immediately
        // Let the 401 interceptor handle it on next request
      }
    };

    // Check immediately
    checkAndRefresh();

    // Then check every 30 minutes
    refreshIntervalRef.current = setInterval(checkAndRefresh, 30 * 60 * 1000);
  };

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Set up proactive token refresh when user is logged in
    if (user || authService.getCurrentUser()) {
      startTokenRefreshScheduler();
    }

    // Cleanup on unmount
    return () => {
      stopTokenRefreshScheduler();
    };
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    // Start token refresh scheduler after login
    startTokenRefreshScheduler();
  };

  const logout = () => {
    stopTokenRefreshScheduler();
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 