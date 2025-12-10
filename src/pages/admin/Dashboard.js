import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardOverview();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to fetch dashboard data';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Dashboard endpoint not found (404). Please ensure:\n' +
            '1. Backend server is running on port 3030\n' +
            '2. The route /api/admin/dashboard/overview is registered\n' +
            '3. You are logged in as an admin user';
        } else if (status === 401) {
          errorMessage = 'Unauthorized (401). Please log in as an admin user.';
        } else if (status === 403) {
          errorMessage = 'Forbidden (403). You do not have admin privileges.';
        } else if (status === 500) {
          errorMessage = 'Server error (500). Please check backend logs.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please ensure:\n' +
          '1. Backend server is running on port 3030\n' +
          '2. Proxy is configured correctly in package.json';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `₹${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

  const formatCount = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="whitespace-pre-line text-sm">{error}</p>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-xs font-medium mb-2">Troubleshooting Steps:</p>
            <ul className="text-xs list-disc list-inside space-y-1">
              <li>Ensure backend server is running on port 3030</li>
              <li>Check that you're logged in as an admin user</li>
              <li>Verify the route /api/admin/dashboard/overview exists</li>
              <li>Check browser console for detailed error logs</li>
            </ul>
            <button
              onClick={fetchDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          No data available
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Properties',
      icon: BuildingOfficeIcon,
      value: dashboardData.totalProperties?.count || 0,
      change: `${dashboardData.totalProperties?.change >= 0 ? '+' : ''}${dashboardData.totalProperties?.change || 0}%`,
      changeType: dashboardData.totalProperties?.changeType || 'increase'
    },
    {
      name: 'Active Users',
      icon: UserGroupIcon,
      value: formatCount(dashboardData.activeUsers?.count || 0),
      change: `${dashboardData.activeUsers?.change >= 0 ? '+' : ''}${dashboardData.activeUsers?.change || 0}%`,
      changeType: dashboardData.activeUsers?.changeType || 'increase'
    },
    {
      name: 'Service Requests',
      icon: WrenchScrewdriverIcon,
      value: dashboardData.serviceRequests?.count || 0,
      change: `${dashboardData.serviceRequests?.change >= 0 ? '+' : ''}${dashboardData.serviceRequests?.change || 0}%`,
      changeType: dashboardData.serviceRequests?.changeType || 'increase'
    },
    {
      name: 'Total Revenue',
      icon: CurrencyDollarIcon,
      value: formatNumber(dashboardData.totalRevenue?.amount || 0),
      change: `${dashboardData.totalRevenue?.change >= 0 ? '+' : ''}${dashboardData.totalRevenue?.change || 0}%`,
      changeType: dashboardData.totalRevenue?.changeType || 'increase'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening with your properties today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`ml-2 text-sm ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="flex items-center">
                      {stat.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      {stat.change}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {dashboardData.quickStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Furniture Items</p>
            <p className="text-xl font-semibold text-gray-900">{dashboardData.quickStats.totalFurnitureItems || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Active Rentals</p>
            <p className="text-xl font-semibold text-gray-900">{dashboardData.quickStats.activeRentals || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Pending Payments</p>
            <p className="text-xl font-semibold text-gray-900">{dashboardData.quickStats.pendingPayments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Overdue Payments</p>
            <p className="text-xl font-semibold text-red-600">{dashboardData.quickStats.overduePayments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-xl font-semibold text-gray-900">{dashboardData.quickStats.totalBookings || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Today's Bookings</p>
            <p className="text-xl font-semibold text-gray-900">{dashboardData.quickStats.todayBookings || 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Properties</h2>
            {dashboardData.recentProperties && dashboardData.recentProperties.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentProperties.map((property) => (
                  <div
                    key={property._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-500">
                        {property.address?.city && property.address?.state
                          ? `${property.address.city}, ${property.address.state}`
                          : property.address?.street || 'Location not specified'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {property.property_type} • {property.listing_type}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      property.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent properties</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                        {activity.user && ` • ${activity.user.name || activity.user.email}`}
                        {activity.customer && ` • ${activity.customer.name || activity.customer.email}`}
                      </p>
                    </div>
                    {activity.status && (
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        activity.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 