import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { adminService } from '../../services/adminService';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const tabs = [
  { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
  { id: 'users', name: 'Users', icon: UserGroupIcon },
  { id: 'properties', name: 'Properties', icon: BuildingOfficeIcon },
  { id: 'furniture', name: 'Furniture', icon: ShoppingBagIcon },
  { id: 'services', name: 'Services', icon: WrenchScrewdriverIcon },
  { id: 'rentals', name: 'Rentals', icon: KeyIcon },
];

function Analytics() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    fetchAnalyticsData(activeTab);
  }, [activeTab]);

  const fetchAnalyticsData = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let response;

      switch (tab) {
        case 'revenue':
          response = await adminService.getRevenueAnalytics({ period: 'monthly' });
          break;
        case 'users':
          response = await adminService.getUserAnalytics({ period: 'monthly' });
          break;
        case 'properties':
          response = await adminService.getPropertyAnalytics();
          break;
        case 'furniture':
          response = await adminService.getFurnitureAnalytics();
          break;
        case 'services':
          response = await adminService.getServiceAnalytics();
          break;
        case 'rentals':
          response = await adminService.getRentalAnalytics();
          break;
        default:
          return;
      }

      if (response.success && response.data) {
        setAnalyticsData(prev => ({ ...prev, [tab]: response.data }));
      } else {
        throw new Error(response.message || `Failed to load ${tab} analytics data`);
      }
    } catch (error) {
      logger.error(`Error fetching ${tab} analytics:`, error);
      
      // Provide more detailed error messages
      let errorMessage = `Failed to fetch ${tab} analytics`;
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = `${tab.charAt(0).toUpperCase() + tab.slice(1)} analytics endpoint not found (404).\n` +
            `Please ensure the backend route /api/admin/analytics/${tab} is registered.`;
        } else if (status === 401) {
          errorMessage = 'Unauthorized (401). Please log in as an admin user.';
        } else if (status === 403) {
          errorMessage = 'Forbidden (403). You do not have admin privileges.';
        } else if (status === 500) {
          errorMessage = 'Server error (500). Please check backend logs.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.request) {
        errorMessage = `Network error. Please ensure:\n` +
          `1. Backend server is running\n` +
          `2. API endpoint /api/admin/analytics/${tab} exists`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount}`;
  };

  const renderRevenueAnalytics = () => {
    const data = analyticsData.revenue;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(data.totalRevenue || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Month over Month</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {data.growth?.monthOverMonth ? `+${data.growth.monthOverMonth}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Year over Year</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {data.growth?.yearOverYear ? `+${data.growth.yearOverYear}%` : 'N/A'}
            </p>
          </div>
        </div>

        {data.byCategory && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rental</span>
                <span className="font-semibold text-gray-900">{formatCurrency(data.byCategory.rental || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Furniture</span>
                <span className="font-semibold text-gray-900">{formatCurrency(data.byCategory.furniture || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold text-gray-900">{formatCurrency(data.byCategory.service || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {data.byPaymentMethod && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(data.byPaymentMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{method}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.trends && data.trends.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Furniture</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.trends.map((trend, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(trend.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(trend.rentalRevenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(trend.furnitureRevenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(trend.serviceRevenue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUserAnalytics = () => {
    const data = analyticsData.users;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Session Time</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.activity?.averageSessionTime ? `${data.activity.averageSessionTime} min` : 'N/A'}
            </p>
          </div>
        </div>

        {data.engagement && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Daily Active Users</span>
                <span className="font-semibold text-gray-900">{data.engagement.dailyActiveUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Weekly Active Users</span>
                <span className="font-semibold text-gray-900">{data.engagement.weeklyActiveUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Monthly Active Users</span>
                <span className="font-semibold text-gray-900">{data.engagement.monthlyActiveUsers || 0}</span>
              </div>
            </div>
          </div>
        )}

        {data.retention && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Retention</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Day 1 Retention</span>
                <span className="font-semibold text-gray-900">{data.retention.day1 || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Day 7 Retention</span>
                <span className="font-semibold text-gray-900">{data.retention.day7 || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Day 30 Retention</span>
                <span className="font-semibold text-gray-900">{data.retention.day30 || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPropertyAnalytics = () => {
    const data = analyticsData.properties;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalProperties || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.conversionRate || 0}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Days on Market</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.averageDaysOnMarket || 0}</p>
          </div>
        </div>

        {data.byStatus && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Properties by Status</h3>
            <div className="space-y-4">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{status}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topProperties && data.topProperties.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Properties</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topProperties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {property.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.views || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.inquiries || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFurnitureAnalytics = () => {
    const data = analyticsData.furniture;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalItems || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Turnover Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.turnoverRate || 0}</p>
          </div>
        </div>

        {data.stockAlerts && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Low Stock</span>
                <span className="font-semibold text-yellow-600">{data.stockAlerts.lowStock || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Out of Stock</span>
                <span className="font-semibold text-red-600">{data.stockAlerts.outOfStock || 0}</span>
              </div>
            </div>
          </div>
        )}

        {data.topItems && data.topItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rentals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rentals || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sales || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.revenue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderServiceAnalytics = () => {
    const data = analyticsData.services;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalBookings || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.completionRate || 0}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Completion Time</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.averageCompletionTime ? `${data.averageCompletionTime} days` : 'N/A'}
            </p>
          </div>
        </div>

        {data.byServiceType && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings by Service Type</h3>
            <div className="space-y-4">
              {Object.entries(data.byServiceType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRentalAnalytics = () => {
    const data = analyticsData.rentals;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Rentals</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalRentals || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.activeRentals || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.paymentStats?.collectionRate || 0}%</p>
          </div>
        </div>

        {data.paymentStats && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Pending</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(data.paymentStats.totalPending || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Overdue</span>
                <span className="font-semibold text-red-600">{formatCurrency(data.paymentStats.totalOverdue || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-semibold text-green-600">{formatCurrency(data.paymentStats.totalPaid || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {data.topCustomers && data.topCustomers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rentals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topCustomers.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.totalRentals || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(customer.totalSpent || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(customer.lifetimeValue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'revenue':
        return renderRevenueAnalytics();
      case 'users':
        return renderUserAnalytics();
      case 'properties':
        return renderPropertyAnalytics();
      case 'furniture':
        return renderFurnitureAnalytics();
      case 'services':
        return renderServiceAnalytics();
      case 'rentals':
        return renderRentalAnalytics();
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Detailed insights and analytics for your business
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Analytics</h3>
          <p className="whitespace-pre-line text-sm">{error}</p>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-xs font-medium mb-2">Troubleshooting Steps:</p>
            <ul className="text-xs list-disc list-inside space-y-1">
              <li>Ensure backend server is running</li>
              <li>Check that you're logged in as an admin user</li>
              <li>Verify the route /api/admin/analytics/{activeTab} exists</li>
              <li>Check browser console for detailed error logs</li>
            </ul>
            <button
              onClick={() => fetchAnalyticsData(activeTab)}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default Analytics;

