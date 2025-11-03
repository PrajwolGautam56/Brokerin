import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

// Test admin email - REMOVE IN PRODUCTION
const ADMIN_EMAIL = 'admin@brokerin.com';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (location.pathname.startsWith('/admin')) {
        const adminStatus = await authService.checkAdmin();
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [location.pathname]);

  // Show loading state while checking admin status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin for admin routes
  if (location.pathname.startsWith('/admin') && !isAdmin) {
    // Redirect non-admin users to home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute; 