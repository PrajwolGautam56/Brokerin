import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { formatPrice } from '../utils/priceFormatter';
import RatingStars from '../components/reviews/RatingStars';
import logger from '../utils/logger';
import toast from 'react-hot-toast';
import { 
  getDashboard, 
  getMyRentals, 
  getMyServiceBookings, 
  getPendingOverduePayments,
  getActivityHistory,
  getMyFurnitureRequests,
  getMyPropertyRequests
} from '../services/userDashboardService';

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [dashboard, setDashboard] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [furnitureRequests, setFurnitureRequests] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, activeTab]);

  // Debug: Log rentals state changes and fallback to dashboard data
  useEffect(() => {
    logger.log('Rentals state updated:', rentals);
    logger.log('Rentals count:', rentals.length);
    if (rentals.length > 0) {
      logger.log('First rental:', rentals[0]);
    }
    
    // Fallback: If rentals are empty but dashboard has rentals, use dashboard data
    if (rentals.length === 0 && dashboard && dashboard.allRentals && Array.isArray(dashboard.allRentals) && dashboard.allRentals.length > 0) {
      logger.log('Rentals array is empty, using dashboard.allRentals as fallback. Count:', dashboard.allRentals.length);
      setRentals(dashboard.allRentals);
    }
  }, [rentals, dashboard]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Get complete dashboard data from unified endpoint
      logger.log('Fetching dashboard data from /api/users/dashboard/me');
      const dashboardResponse = await getDashboard();
      logger.log('Dashboard response:', dashboardResponse);
      
      // Handle response structure: { success: true, data: { allRentals: [...], ... } }
      let dashboardData = null;
      
      if (dashboardResponse.success && dashboardResponse.data) {
        // Standard structure: { success: true, data: { ... } }
        dashboardData = dashboardResponse.data;
        logger.log('Using dashboardResponse.data (success: true)');
      } else if (dashboardResponse.data) {
        // Nested data structure
        dashboardData = dashboardResponse.data;
        logger.log('Using dashboardResponse.data');
      } else if (dashboardResponse.allRentals || dashboardResponse.stats) {
        // Backend returns data directly (not nested in data)
        dashboardData = dashboardResponse;
        logger.log('Using dashboardResponse directly (has allRentals or stats)');
      } else {
        // Fallback: use response as-is
        dashboardData = dashboardResponse;
        logger.log('Using dashboardResponse as fallback');
      }
      
      logger.log('Dashboard data extracted:', dashboardData);
      logger.log('Dashboard data keys:', Object.keys(dashboardData || {}));
      
      // Log specific fields we're looking for
      logger.log('Checking for rentals fields:');
      logger.log('  - dashboardData.allRentals:', dashboardData?.allRentals);
      logger.log('  - dashboardData.recentRentals:', dashboardData?.recentRentals);
      logger.log('  - dashboardData.rentals:', dashboardData?.rentals);
      logger.log('  - dashboardData.stats:', dashboardData?.stats);
      
      // Log full structure (but limit depth to avoid huge logs)
      try {
        logger.log('Full dashboard data (first level):', JSON.stringify(dashboardData, null, 2).substring(0, 2000));
      } catch (e) {
        logger.log('Could not stringify dashboard data');
      }
      
      // Store complete dashboard data
      if (dashboardData) {
        setDashboard(dashboardData);
        
        // Check for rentals in multiple possible fields
        let rentalsArray = null;
        
        // Try allRentals first (primary field)
        if (dashboardData.allRentals && Array.isArray(dashboardData.allRentals)) {
          rentalsArray = dashboardData.allRentals;
          logger.log('✅ Found rentals in dashboardData.allRentals');
        }
        // Try recentRentals as fallback
        else if (dashboardData.recentRentals && Array.isArray(dashboardData.recentRentals)) {
          rentalsArray = dashboardData.recentRentals;
          logger.log('✅ Found rentals in dashboardData.recentRentals (using as fallback)');
        }
        // Try rentals (without prefix)
        else if (dashboardData.rentals && Array.isArray(dashboardData.rentals)) {
          rentalsArray = dashboardData.rentals;
          logger.log('✅ Found rentals in dashboardData.rentals');
        }
        
        if (rentalsArray && rentalsArray.length > 0) {
          logger.log('✅ Setting rentals from dashboard. Count:', rentalsArray.length);
          logger.log('Rentals data:', rentalsArray);
          setRentals(rentalsArray);
        } else {
          logger.warn('⚠️ Dashboard data does not contain rentals in any expected field');
          logger.warn('Dashboard data structure:', {
            hasAllRentals: !!dashboardData.allRentals,
            allRentalsType: typeof dashboardData.allRentals,
            allRentalsIsArray: Array.isArray(dashboardData.allRentals),
            allRentalsLength: dashboardData.allRentals?.length,
            hasRecentRentals: !!dashboardData.recentRentals,
            recentRentalsLength: dashboardData.recentRentals?.length,
            hasRentals: !!dashboardData.rentals,
            rentalsLength: dashboardData.rentals?.length,
            stats: dashboardData.stats,
            keys: Object.keys(dashboardData)
          });
        }
          
          // Set furniture requests from dashboard if available
          if (dashboardData.allFurnitureRequests && Array.isArray(dashboardData.allFurnitureRequests)) {
            logger.log('Setting furniture requests from dashboard:', dashboardData.allFurnitureRequests);
            setFurnitureRequests(dashboardData.allFurnitureRequests);
          }
          
          // Set service bookings from dashboard if available
          if (dashboardData.allServiceBookings && Array.isArray(dashboardData.allServiceBookings)) {
            logger.log('Setting service bookings from dashboard:', dashboardData.allServiceBookings);
            setServiceBookings(dashboardData.allServiceBookings);
          }
          
          // Set property requests from dashboard if available
          if (dashboardData.allPropertyRequests && Array.isArray(dashboardData.allPropertyRequests)) {
            logger.log('Setting property requests from dashboard:', dashboardData.allPropertyRequests);
            setPropertyRequests(dashboardData.allPropertyRequests);
          }
          
          // Set activities from dashboard if available
          if (dashboardData.activityLog && Array.isArray(dashboardData.activityLog)) {
            logger.log('Setting activities from dashboard:', dashboardData.activityLog);
            setActivities(dashboardData.activityLog);
          }
        }
      } catch (err) {
        logger.warn('Dashboard endpoint not available, will fetch individual data:', err);
      }
      
      // Always try to fetch rentals individually as a fallback
      // Even if dashboard has rentals, we want to ensure we have the latest data
      // But prioritize dashboard data if it exists
      const hasRentalsInDashboard = dashboardData && 
        ((dashboardData.allRentals && Array.isArray(dashboardData.allRentals) && dashboardData.allRentals.length > 0) ||
         (dashboardData.recentRentals && Array.isArray(dashboardData.recentRentals) && dashboardData.recentRentals.length > 0) ||
         (dashboardData.rentals && Array.isArray(dashboardData.rentals) && dashboardData.rentals.length > 0));
      
      if (!hasRentalsInDashboard) {
        logger.log('⚠️ Dashboard did not provide rentals, fetching individually from /api/rentals/my-rentals');
        await loadRentals();
      } else {
        logger.log('✅ Rentals found in dashboard, but will also fetch individually to ensure latest data');
        // Still fetch individually to ensure we have the latest data
        // The loadRentals function will update state, which will override dashboard data
        await loadRentals();
      }
      // Furniture requests: Only fetch individually if dashboard didn't provide them
      // Now using user-specific endpoint /api/furniture-forms/me
      if (!dashboardData || !dashboardData.allFurnitureRequests || !Array.isArray(dashboardData.allFurnitureRequests) || dashboardData.allFurnitureRequests.length === 0) {
        logger.log('Dashboard missing furniture requests, fetching individually from /api/furniture-forms/me');
        await loadFurnitureRequests();
      } else {
        logger.log('✅ Furniture requests already loaded from dashboard');
      }
      
      if (!dashboardData || !dashboardData.allServiceBookings || !Array.isArray(dashboardData.allServiceBookings) || dashboardData.allServiceBookings.length === 0) {
        logger.log('Dashboard missing service bookings, fetching individually');
        await loadServiceBookings();
      } else {
        logger.log('✅ Service bookings already loaded from dashboard');
      }
      
      if (!dashboardData || !dashboardData.allPropertyRequests || !Array.isArray(dashboardData.allPropertyRequests) || dashboardData.allPropertyRequests.length === 0) {
        logger.log('Dashboard missing property requests, fetching individually');
        await loadPropertyRequests();
      } else {
        logger.log('✅ Property requests already loaded from dashboard');
      }
      
      if (!dashboardData || !dashboardData.activityLog || !Array.isArray(dashboardData.activityLog) || dashboardData.activityLog.length === 0) {
        logger.log('Dashboard missing activity log, fetching individually');
        await loadActivity();
      } else {
        logger.log('✅ Activity log already loaded from dashboard');
      }
      
      // Always load these as they might not be in dashboard
      await Promise.all([
        loadPayments(),
        loadReviews()
      ]);
    } catch (error) {
      logger.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadIndividualData = async () => {
    try {
      await Promise.all([
        loadRentals(),
        loadFurnitureRequests(),
        loadServiceBookings(),
        loadPropertyRequests(),
        loadActivity(),
        loadPayments()
      ]);
    } catch (error) {
      logger.error('Error loading individual data:', error);
    }
  };

  const loadRentals = async () => {
    try {
      logger.log('Fetching rentals from /api/rentals/my-rentals');
      const response = await getMyRentals();
      logger.log('Rentals response:', response);
      logger.log('Rentals response type:', typeof response);
      logger.log('Is array:', Array.isArray(response));
      logger.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle different response structures
      let ordersData = [];
      if (response.success && response.data) {
        ordersData = Array.isArray(response.data) ? response.data : [];
        logger.log('Using response.data (success: true)');
      } else if (response.data) {
        ordersData = Array.isArray(response.data) ? response.data : [];
        logger.log('Using response.data');
      } else if (Array.isArray(response)) {
        ordersData = response;
        logger.log('Using response directly (array)');
      } else if (response.rentals) {
        ordersData = Array.isArray(response.rentals) ? response.rentals : [];
        logger.log('Using response.rentals');
      } else {
        logger.warn('Unknown response structure:', response);
      }
      
      logger.log('Processed rentals count:', ordersData.length);
      logger.log('Processed rentals:', ordersData);
      
      if (ordersData.length === 0) {
        logger.warn('No rentals found in response. Full response:', response);
      }
      
      // Log each rental's status to debug
      ordersData.forEach((rental, index) => {
        logger.log(`Rental ${index + 1}:`, {
          id: rental._id,
          rental_id: rental.rental_id,
          customer_email: rental.customer_email,
          order_status: rental.order_status,
          status: rental.status,
          items_count: rental.items?.length || 0
        });
      });
      
      setRentals(ordersData);
    } catch (error) {
      logger.error('Error loading rentals:', error);
      logger.error('Error response:', error.response?.data);
      logger.error('Error status:', error.response?.status);
      toast.error('Failed to load rentals. Please try refreshing the page.');
      setRentals([]);
    }
  };

  const loadFurnitureRequests = async () => {
    try {
      const response = await getMyFurnitureRequests();
      logger.log('Furniture requests response:', response);
      
      // Handle response structure from new endpoint: { success: true, data: [...], count: N, requests: [...] }
      let requestsData = [];
      if (response.success && response.data) {
        requestsData = Array.isArray(response.data) ? response.data : [];
      } else if (response.data) {
        requestsData = Array.isArray(response.data) ? response.data : [];
      } else if (response.requests) {
        requestsData = Array.isArray(response.requests) ? response.requests : [];
      } else if (Array.isArray(response)) {
        requestsData = response;
      }
      
      logger.log('Processed furniture requests count:', requestsData.length);
      logger.log('Processed furniture requests:', requestsData);
      setFurnitureRequests(requestsData);
    } catch (error) {
      logger.error('Error loading furniture requests:', error);
      // Set empty array on error
      setFurnitureRequests([]);
    }
  };

  const loadServiceBookings = async () => {
    try {
      const response = await getMyServiceBookings();
      logger.log('Service bookings response:', response);
      
      let bookingsData = [];
      if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response.data) {
        bookingsData = Array.isArray(response.data) ? response.data : [];
      } else if (response.success && response.data) {
        bookingsData = Array.isArray(response.data) ? response.data : [];
      }
      
      logger.log('Processed service bookings:', bookingsData);
      setServiceBookings(bookingsData);
    } catch (error) {
      logger.error('Error loading service bookings:', error);
      setServiceBookings([]);
    }
  };

  const loadPropertyRequests = async () => {
    try {
      const response = await getMyPropertyRequests();
      logger.log('Property requests response:', response);
      
      // Handle response structure from new endpoint: { success: true, data: [...], count: N }
      let requestsData = [];
      if (response.success && response.data) {
        requestsData = Array.isArray(response.data) ? response.data : [];
      } else if (response.data) {
        requestsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        requestsData = response;
      }
      
      logger.log('Processed property requests count:', requestsData.length);
      logger.log('Processed property requests:', requestsData);
      setPropertyRequests(requestsData);
    } catch (error) {
      logger.error('Error loading property requests:', error);
      setPropertyRequests([]);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewService.getMyReviews();
      setReviews(response.data?.reviews || response.reviews || []);
    } catch (error) {
      logger.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadActivity = async () => {
    try {
      const response = await getActivityHistory();
      const activitiesData = response.success && response.data 
        ? (Array.isArray(response.data) ? response.data : [])
        : (Array.isArray(response) ? response : []);
      setActivities(activitiesData);
    } catch (error) {
      logger.error('Error loading activity:', error);
      setActivities([]);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await getPendingOverduePayments();
      const paymentsData = response.success && response.data 
        ? (Array.isArray(response.data) ? response.data : [])
        : (Array.isArray(response) ? response : []);
      setPendingPayments(paymentsData);
    } catch (error) {
      logger.error('Error loading payments:', error);
      setPendingPayments([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) return null;

  // Calculate stats - use dashboard stats if available, otherwise calculate from data
  const stats = dashboard?.stats || {
    totalRentals: rentals.length,
    activeRentals: rentals.filter(r => r.status === 'Active' || r.order_status === 'Delivered' || r.order_status === 'Confirmed').length,
    totalFurnitureRequests: furnitureRequests.length,
    totalServiceBookings: serviceBookings.length,
    totalPropertyRequests: propertyRequests.length
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.fullName || user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-violet-600">{stats.totalRentals || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-green-600">{stats.activeRentals || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Active Rentals</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">{stats.totalFurnitureRequests || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Furniture Requests</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-orange-600">{stats.totalServiceBookings || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Service Bookings</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-purple-600">{stats.totalPropertyRequests || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Property Requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl text-violet-600 font-bold">
                    {user.fullName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="font-bold text-gray-900">{user.fullName || user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders ({stats.totalRentals || 0})
                </button>
                <button
                  onClick={() => setActiveTab('furniture')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'furniture'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Furniture Requests ({stats.totalFurnitureRequests || 0})
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'services'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Service Bookings ({stats.totalServiceBookings || 0})
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'properties'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Property Requests ({stats.totalPropertyRequests || 0})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'payments'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'reviews'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  My Reviews
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activity Log
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-violet-50 text-violet-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
              </nav>

              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <OverviewTab 
                    dashboard={dashboard}
                    rentals={rentals}
                    furnitureRequests={furnitureRequests}
                    serviceBookings={serviceBookings}
                    propertyRequests={propertyRequests}
                    getStatusColor={getStatusColor}
                    formatPrice={formatPrice}
                    navigate={navigate}
                  />
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <RentalsTab 
                    rentals={rentals}
                    getStatusColor={getStatusColor}
                    formatPrice={formatPrice}
                    navigate={navigate}
                  />
                )}

                {/* Furniture Requests Tab */}
                {activeTab === 'furniture' && (
                  <FurnitureRequestsTab 
                    requests={furnitureRequests}
                    getStatusColor={getStatusColor}
                    navigate={navigate}
                  />
                )}

                {/* Service Bookings Tab */}
                {activeTab === 'services' && (
                  <ServiceBookingsTab 
                    bookings={serviceBookings}
                    getStatusColor={getStatusColor}
                    navigate={navigate}
                  />
                )}

                {/* Property Requests Tab */}
                {activeTab === 'properties' && (
                  <PropertyRequestsTab 
                    requests={propertyRequests}
                    getStatusColor={getStatusColor}
                    navigate={navigate}
                  />
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <PaymentsTab 
                    payments={pendingPayments}
                    formatPrice={formatPrice}
                    navigate={navigate}
                  />
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <ReviewsTab reviews={reviews} />
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <ActivityTab activities={activities} />
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <ProfileTab user={user} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ dashboard, rentals, furnitureRequests, serviceBookings, propertyRequests, getStatusColor, formatPrice, navigate }) {
  // Use dashboard data if available, otherwise use state data
  const recentRentals = (dashboard?.recentRentals && dashboard.recentRentals.length > 0) 
    ? dashboard.recentRentals 
    : (rentals.length > 0 ? rentals.slice(0, 5) : []);
  const recentFurniture = (dashboard?.recentFurnitureRequests && dashboard.recentFurnitureRequests.length > 0)
    ? dashboard.recentFurnitureRequests
    : (furnitureRequests.length > 0 ? furnitureRequests.slice(0, 5) : []);
  const recentServices = (dashboard?.recentServiceBookings && dashboard.recentServiceBookings.length > 0)
    ? dashboard.recentServiceBookings
    : (serviceBookings.length > 0 ? serviceBookings.slice(0, 5) : []);
  const recentProperties = (dashboard?.recentPropertyRequests && dashboard.recentPropertyRequests.length > 0)
    ? dashboard.recentPropertyRequests
    : (propertyRequests.length > 0 ? propertyRequests.slice(0, 5) : []);
  
  logger.log('OverviewTab - recentRentals:', recentRentals);
  logger.log('OverviewTab - rentals state:', rentals);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
      
      {/* Recent Orders */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
          <button onClick={() => navigate('/furniture')} className="text-violet-600 hover:text-violet-700 font-semibold">
            Shop Now →
          </button>
        </div>
        {recentRentals.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentRentals.map((rental) => (
              <div key={rental._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Order: {rental.rental_id}</h4>
                    <p className="text-sm text-gray-600">{rental.items?.length || 0} items</p>
                    <p className="text-sm text-gray-600">{formatPrice(rental.total_amount || (rental.total_monthly_amount + rental.total_deposit + (rental.delivery_charge || 0)))}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(rental.order_status)}`}>
                      {rental.order_status || 'Pending'}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{new Date(rental.order_placed_at || rental.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Furniture Requests */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Furniture Requests</h3>
        {recentFurniture.length === 0 ? (
          <p className="text-gray-600">No furniture requests yet</p>
        ) : (
          <div className="space-y-3">
            {recentFurniture.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.furniture_name || 'Furniture Request'}</h4>
                    <p className="text-sm text-gray-600">{new Date(request.createdAt || request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Service Bookings */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Service Bookings</h3>
        {recentServices.length === 0 ? (
          <p className="text-gray-600">No service bookings yet</p>
        ) : (
          <div className="space-y-3">
            {recentServices.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.service_type}</h4>
                    <p className="text-sm text-gray-600">{new Date(booking.preferred_date || booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Rentals Tab Component
function RentalsTab({ rentals, getStatusColor, formatPrice, navigate }) {
  // Log rentals for debugging
  React.useEffect(() => {
    logger.log('RentalsTab - rentals array:', rentals);
    logger.log('RentalsTab - rentals count:', rentals.length);
    rentals.forEach((rental, index) => {
      logger.log(`RentalsTab - Rental ${index + 1}:`, {
        id: rental._id,
        rental_id: rental.rental_id,
        order_status: rental.order_status,
        status: rental.status
      });
    });
  }, [rentals]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Orders ({rentals.length})</h2>
        <Link
          to="/furniture"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Shop Now
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link
            to="/furniture"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Browse Furniture
          </Link>
        </div>
      ) : (
        rentals.map((order, index) => {
          logger.log(`Rendering rental ${index + 1}:`, order.rental_id, order.order_status);
          return (
            <div key={order._id || order.rental_id || `rental-${index}`} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Order #{order.rental_id}</h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.order_placed_at || order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.order_status)}`}>
                  {order.order_status || 'Pending'}
                </span>
                <Link
                  to={`/orders/${order._id}`}
                  className="text-violet-600 hover:text-violet-700 font-semibold"
                >
                  Track →
                </Link>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {order.items?.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.photos?.[0] ? (
                      <img src={item.photos[0]} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{item.product_name}</h4>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-violet-600 font-semibold text-sm">
                      {formatPrice(item.monthly_price)}/month
                    </p>
                  </div>
                </div>
              ))}
              {order.items?.length > 2 && (
                <p className="text-sm text-gray-600">+ {order.items.length - 2} more items</p>
              )}
            </div>

            {/* Payment Summary */}
            {order.payment_summary && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatPrice(order.payment_summary.monthly_rent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-yellow-600 font-semibold">{formatPrice(order.payment_summary.total_pending)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue:</span>
                    <span className="text-red-600 font-semibold">{formatPrice(order.payment_summary.total_overdue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span className="text-green-600 font-semibold">{formatPrice(order.payment_summary.total_paid)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice((order.total_monthly_amount || 0) + (order.total_deposit || 0) + (order.delivery_charge || 0))}
                </p>
              </div>
              <Link
                to={`/orders/${order._id}`}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
              >
                View Details
              </Link>
            </div>
          </div>
          );
        })
      )}
    </div>
  );
}

// Furniture Requests Tab Component
function FurnitureRequestsTab({ requests, getStatusColor, navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Furniture Requests</h2>
        <Link
          to="/furniture"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Browse Furniture
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Furniture Requests Yet</h3>
          <p className="text-gray-600 mb-6">Request furniture items that are out of stock!</p>
          <Link
            to="/furniture"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Browse Furniture
          </Link>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{request.furniture_name || 'Furniture Request'}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(request.createdAt || request.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                {request.status || 'Pending'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p><strong>Type:</strong> {request.listing_type || request.type || 'Rent'}</p>
              {request.message && <p><strong>Message:</strong> {request.message}</p>}
              {request.payment_status && <p><strong>Payment:</strong> {request.payment_status}</p>}
              {request.scheduled_delivery_date && (
                <p><strong>Delivery:</strong> {new Date(request.scheduled_delivery_date).toLocaleDateString()}</p>
              )}
            </div>

            {request.furniture_id && (
              <Link
                to={`/furniture/${request.furniture_id}`}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                View Furniture →
              </Link>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Service Bookings Tab Component
function ServiceBookingsTab({ bookings, getStatusColor, navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Service Bookings</h2>
        <Link
          to="/services"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Book a Service
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Service Bookings Yet</h3>
          <p className="text-gray-600 mb-6">Book services like cleaning, maintenance, and more!</p>
          <Link
            to="/services"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Book a Service
          </Link>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{booking.service_type}</h3>
                <p className="text-sm text-gray-600">Booking ID: {booking.service_booking_id || booking._id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status || 'Pending'}
              </span>
            </div>

            <div className="space-y-2">
              <p><strong>Date:</strong> {new Date(booking.preferred_date || booking.created_at).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.preferred_time}</p>
              <p><strong>Address:</strong> {booking.service_address}</p>
              {booking.additional_notes && <p><strong>Notes:</strong> {booking.additional_notes}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Property Requests Tab Component
function PropertyRequestsTab({ requests, getStatusColor, navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Property Requests</h2>
        <Link
          to="/properties"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Browse Properties
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Property Requests Yet</h3>
          <p className="text-gray-600 mb-6">Request information about properties you're interested in!</p>
          <Link
            to="/properties"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{request.property_name || 'Property Request'}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(request.createdAt || request.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                {request.status || 'Pending'}
              </span>
            </div>

            {request.message && (
              <p className="text-gray-700 mb-4">{request.message}</p>
            )}

            {request.property_id && (
              <Link
                to={`/properties/${request.property_id}`}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                View Property →
              </Link>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Payments Tab Component
function PaymentsTab({ payments, formatPrice, navigate }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending & Overdue Payments</h2>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Payments</h3>
          <p className="text-gray-600">All your payments are up to date!</p>
        </div>
      ) : (
        payments.map((paymentGroup) => (
          <div key={paymentGroup.rental_id} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order: {paymentGroup.rental_id}</h3>
            
            {paymentGroup.pending_payments && paymentGroup.pending_payments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-yellow-600 mb-2">Pending Payments</h4>
                {paymentGroup.pending_payments.map((payment) => (
                  <div key={payment._id} className="border border-yellow-200 rounded-lg p-3 mb-2">
                    <div className="flex justify-between">
                      <span>{payment.month}</span>
                      <span className="font-semibold">{formatPrice(payment.amount)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            {paymentGroup.overdue_payments && paymentGroup.overdue_payments.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Overdue Payments</h4>
                {paymentGroup.overdue_payments.map((payment) => (
                  <div key={payment._id} className="border border-red-200 rounded-lg p-3 mb-2">
                    <div className="flex justify-between">
                      <span>{payment.month}</span>
                      <span className="font-semibold text-red-600">{formatPrice(payment.amount)}</span>
                    </div>
                    <p className="text-sm text-red-600">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-6">Share your experience with the products you've rented!</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {review.furniture_id?.photos?.[0] ? (
                  <img 
                    src={review.furniture_id.photos[0]} 
                    alt={review.furniture_id.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{review.furniture_id?.name}</h3>
                <RatingStars rating={review.rating} size="sm" />
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 h-fit rounded-full text-xs font-semibold ${
                review.status === 'Approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {review.status}
              </span>
            </div>

            {review.title && (
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
            )}
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ activities }) {
  const getActivityIcon = (action) => {
    const icons = {
      'service_booking': '📅',
      'property_request': '🏠',
      'furniture_request': '🪑',
      'rental_order': '🛒',
      'payment': '💳',
      'view_service_bookings': '👁️'
    };
    return icons[action] || '📝';
  };

  const formatActivityAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatActivityDetails = (details) => {
    if (!details) return '';
    return Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h2>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-600">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 flex gap-4">
              <div className="text-3xl">{getActivityIcon(activity.action)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{formatActivityAction(activity.action)}</h4>
                <p className="text-sm text-gray-600">{formatActivityDetails(activity.details)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={user.fullName || user.name || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={user.phoneNumber || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        {user.username && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={user.username || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        )}
        <p className="text-sm text-gray-600 mt-4">
          To update your profile information, please contact support.
        </p>
      </div>
    </div>
  );
}

export default UserDashboard;
