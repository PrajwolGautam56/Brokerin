import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

function UserDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user dashboard...');
      const response = await userService.getMyDashboard();
      console.log('Dashboard response:', response);
      
      // API returns: { success: true, data: {...} }
      let dashboardData = null;
      
      if (response.success && response.data) {
        // Handle API format: { success: true, data: {...} }
        dashboardData = response.data;
        console.log('Extracted data from response.data:', dashboardData);
      } else if (response.data) {
        // Handle if data is already extracted
        dashboardData = response.data;
        console.log('Using response.data:', dashboardData);
      } else if (response.user || response.stats) {
        // Handle if response is already the data object
        dashboardData = response;
        console.log('Using response as dashboard data:', dashboardData);
      }
      
      console.log('Setting dashboard data:', dashboardData);
      
      // If still no data, create a fallback
      if (!dashboardData || (!dashboardData.stats && !dashboardData.user)) {
        console.log('No proper dashboard data, using fallback structure');
        dashboardData = {
          user: 'User',
          stats: {
            totalPropertyRequests: 0,
            totalFurnitureRequests: 0,
            totalServiceBookings: 0,
            totalContactInquiries: 0,
            totalActivities: 0
          },
          recentPropertyRequests: [],
          recentFurnitureRequests: [],
          recentServiceBookings: [],
          recentContactInquiries: [],
          allContactInquiries: [],
          activityLog: []
        };
      }
      
      setDashboard(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      // Set fallback dashboard
      setDashboard({
        user: 'User',
        stats: {
          totalPropertyRequests: 0,
          totalFurnitureRequests: 0,
          totalServiceBookings: 0,
          totalActivities: 0
        },
        recentPropertyRequests: [],
        recentFurnitureRequests: [],
        recentServiceBookings: [],
        recentContactInquiries: [],
        allContactInquiries: [],
        activityLog: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    // Property/Furniture request statuses
    if (statusLower === 'requested' || statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'confirmed' || statusLower === 'accepted') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'rejected' || statusLower === 'cancelled' || statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800';
    }
    // Service booking statuses
    else if (statusLower === 'ongoing') {
      return 'bg-blue-100 text-blue-800';
    } else if (statusLower === 'completed') {
      return 'bg-teal-100 text-teal-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {typeof dashboard.user === 'object' ? (dashboard.user?.fullName || dashboard.user?.name || dashboard.user?.email) : (dashboard.user || 'User')}!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!dashboard.stats && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center mb-8">
            <p className="text-gray-600">No data available yet. Start by making some requests!</p>
          </div>
        )}

        {/* Stats Cards */}
        {dashboard.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-violet-100 rounded-lg p-3">
                  <UserIcon className="h-8 w-8 text-violet-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Property Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalPropertyRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Furniture Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalFurnitureRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Service Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalServiceBookings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalActivities || dashboard.stats.totalSubmissions || 0}</p>
                </div>
              </div>
            </div>

            {dashboard.stats.totalContactInquiries !== undefined && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <EnvelopeIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Contact Inquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalContactInquiries || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'property', 'furniture', 'services', 'contact', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'property' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">All Property Requests</h2>
                {dashboard.allPropertyRequests && dashboard.allPropertyRequests.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {dashboard.allPropertyRequests.length}
                  </span>
                )}
              </div>
              {dashboard.allPropertyRequests && dashboard.allPropertyRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.allPropertyRequests.map((req) => {
                        const propertyName = req.property_name || req.property_details?.name || req.property?.name || req.property_id || '-';
                        const propertyPhoto = req.property_details?.photos?.[0] || req.property?.photos?.[0] || req.property_photo;
                        const propertyLocation = req.property_details?.location || req.property?.location;
                        return (
                          <tr key={req._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {propertyPhoto && (
                                  <img 
                                    src={propertyPhoto} 
                                    alt={propertyName}
                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{propertyName}</div>
                                  {propertyLocation && (
                                    <div className="text-xs text-gray-500">{propertyLocation}</div>
                                  )}
                                  {req.message && (
                                    <div className="text-xs text-gray-400 mt-1 italic max-w-xs truncate" title={req.message}>
                                      "{req.message}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                {req.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No property requests found</p>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Property Requests */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Property Requests</h2>
                {dashboard.recentPropertyRequests && dashboard.recentPropertyRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.recentPropertyRequests.slice(0, 5).map((req) => {
                        const propertyName = req.property_name || req.property_details?.name || req.property?.name || req.property_id || '-';
                        const propertyPhoto = req.property_details?.photos?.[0] || req.property?.photos?.[0] || req.property_photo;
                        const propertyLocation = req.property_details?.location || req.property?.location;
                        return (
                          <tr key={req._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {propertyPhoto && (
                                  <img 
                                    src={propertyPhoto} 
                                    alt={propertyName}
                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{propertyName}</div>
                                  {propertyLocation && (
                                    <div className="text-xs text-gray-500">{propertyLocation}</div>
                                  )}
                                  {req.message && (
                                    <div className="text-xs text-gray-400 mt-1 italic max-w-xs truncate" title={req.message}>
                                      "{req.message}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                {req.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No property requests found</p>
              )}
              </div>

              {/* Recent Contact Inquiries */}
              {dashboard.recentContactInquiries && dashboard.recentContactInquiries.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Contact Inquiries</h2>
                  <div className="space-y-4">
                    {dashboard.recentContactInquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-violet-500">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{inquiry.subject || 'No Subject'}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            inquiry.status === 'new' 
                              ? 'bg-blue-100 text-blue-800'
                              : inquiry.status === 'read'
                              ? 'bg-yellow-100 text-yellow-800'
                              : inquiry.status === 'responded'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{inquiry.message}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '-'}</span>
                          {inquiry.contact_id && <span>ID: {inquiry.contact_id}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'furniture' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Furniture Requests</h2>
                {dashboard.allFurnitureRequests && dashboard.allFurnitureRequests.length > 5 && (
                  <span className="text-sm text-gray-500">
                    Showing 5 of {dashboard.allFurnitureRequests.length}
                  </span>
                )}
              </div>
              {dashboard.recentFurnitureRequests && dashboard.recentFurnitureRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Furniture</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.recentFurnitureRequests.slice(0, 5).map((req) => {
                        const furnitureName = req.furniture_name || req.furniture_details?.name || req.furniture?.name || req.furniture_id || '-';
                        const furniturePhoto = req.furniture_details?.photos?.[0] || req.furniture?.photos?.[0] || req.furniture_photo;
                        const furnitureCategory = req.furniture_details?.category || req.furniture?.category;
                        return (
                          <tr key={req._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {furniturePhoto && (
                                  <img 
                                    src={furniturePhoto} 
                                    alt={furnitureName}
                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{furnitureName}</div>
                                  {furnitureCategory && (
                                    <div className="text-xs text-gray-500">{furnitureCategory}</div>
                                  )}
                                  {req.message && (
                                    <div className="text-xs text-gray-400 mt-1 italic max-w-xs truncate" title={req.message}>
                                      "{req.message}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.listing_type || req.furniture_details?.listing_type || req.furniture?.listing_type || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                {req.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No furniture requests found</p>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Service Bookings</h2>
                {dashboard.allServiceBookings && dashboard.allServiceBookings.length > 5 && (
                  <span className="text-sm text-gray-500">
                    Showing 5 of {dashboard.allServiceBookings.length}
                  </span>
                )}
              </div>
              {dashboard.recentServiceBookings && dashboard.recentServiceBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.recentServiceBookings.slice(0, 5).map((booking) => {
                        const bookingDate = booking.created_at || booking.createdAt;
                        const preferredDate = booking.preferred_date;
                        return (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {booking.service_type?.replace('_', ' ') || '-'}
                              </div>
                              {booking.service_booking_id && (
                                <div className="text-xs text-gray-500">#{booking.service_booking_id}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {booking.service_address ? (
                                <div className="max-w-xs truncate" title={booking.service_address}>
                                  {booking.service_address}
                                </div>
                              ) : '-'}
                              {preferredDate && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(preferredDate).toLocaleDateString()} {booking.preferred_time && `at ${booking.preferred_time}`}
                                </div>
                              )}
                              {booking.additional_notes && (
                                <div className="text-xs text-gray-400 mt-1 italic max-w-xs truncate" title={booking.additional_notes}>
                                  Note: {booking.additional_notes}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status?.toUpperCase() || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bookingDate ? new Date(bookingDate).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No service bookings found</p>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Contact Inquiries</h2>
                {dashboard.allContactInquiries && dashboard.allContactInquiries.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {dashboard.allContactInquiries.length}
                  </span>
                )}
              </div>
              {dashboard.allContactInquiries && dashboard.allContactInquiries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.allContactInquiries.map((inquiry) => (
                        <tr key={inquiry._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{inquiry.subject || '-'}</div>
                            {inquiry.contact_id && (
                              <div className="text-xs text-gray-500">ID: {inquiry.contact_id}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md">
                              <p className="truncate" title={inquiry.message}>
                                {inquiry.message || '-'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inquiry.status === 'new' 
                                ? 'bg-blue-100 text-blue-800'
                                : inquiry.status === 'read'
                                ? 'bg-yellow-100 text-yellow-800'
                                : inquiry.status === 'responded'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No contact inquiries found</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity History</h2>
              {dashboard.activityLog && dashboard.activityLog.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.activityLog.slice(0, 10).map((activity, index) => (
                    <div key={index} className="border-l-4 border-violet-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {activity.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '-'}
                      </span>
                    </div>
                    {activity.details && (
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        {activity.details.property_name && (
                          <div><strong>Property:</strong> {activity.details.property_name}</div>
                        )}
                        {activity.details.property_id && (
                          <div><strong>Property ID:</strong> {activity.details.property_id}</div>
                        )}
                        {activity.details.furniture_name && (
                          <div><strong>Furniture:</strong> {activity.details.furniture_name}</div>
                        )}
                        {activity.details.request_id && (
                          <div><strong>Request ID:</strong> {activity.details.request_id}</div>
                        )}
                        {activity.details.contact_id && (
                          <div><strong>Contact ID:</strong> {activity.details.contact_id}</div>
                        )}
                        {activity.details.subject && (
                          <div><strong>Subject:</strong> {activity.details.subject}</div>
                        )}
                        {!activity.details.property_name && !activity.details.furniture_name && !activity.details.contact_id && Object.keys(activity.details).length > 0 && (
                          <div className="text-xs font-mono bg-white p-2 rounded mt-2">
                            {JSON.stringify(activity.details, null, 2)}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

