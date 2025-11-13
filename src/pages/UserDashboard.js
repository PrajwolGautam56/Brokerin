import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { rentalService } from '../services/rentalService';
import { paymentService } from '../services/paymentService';
import { furnitureService } from '../services/furnitureService';
import MonthlyPaymentCard from '../components/payment/MonthlyPaymentCard';
import RazorpayButton from '../components/payment/RazorpayButton';
import { UserIcon, EnvelopeIcon, KeyIcon, CreditCardIcon } from '@heroicons/react/24/outline';

function UserDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [furnitureRequests, setFurnitureRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentOrderData, setPaymentOrderData] = useState({});

  useEffect(() => {
    fetchDashboard();
    fetchRentals();
    fetchPendingPayments();
    fetchPendingOverdue();
    fetchFurnitureRequests();
  }, []);

  const fetchFurnitureRequests = async () => {
    try {
      const response = await furnitureService.getAllFurnitureRequests();
      const requests = response.data || response.requests || response || [];
      setFurnitureRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      console.error('Error fetching furniture requests:', err);
      setFurnitureRequests([]);
    }
  };

  const handleFurniturePayment = async (requestId) => {
    try {
      // Create payment order
      const orderResponse = await paymentService.createOrder({
        amount: 0, // Amount will be set by backend based on furniture
        currency: 'INR',
        furniture_request_id: requestId
      });
      
      setPaymentOrderData(prev => ({
        ...prev,
        [requestId]: orderResponse.data || orderResponse
      }));
    } catch (err) {
      console.error('Error creating payment order:', err);
      setError(err.response?.data?.message || 'Failed to create payment order');
    }
  };

  const handleFurniturePaymentSuccess = async (requestId, paymentResponse) => {
    try {
      // Update payment status after successful payment
      await furnitureService.updateFurnitureRequest(requestId, {
        payment_status: 'Paid'
      });
      
      // Refresh furniture requests
      await fetchFurnitureRequests();
      
      // Clear payment order data
      setPaymentOrderData(prev => {
        const newData = { ...prev };
        delete newData[requestId];
        return newData;
      });
      
      setError(null);
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError(err.response?.data?.message || 'Payment successful but failed to update status');
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await paymentService.getPendingMonthlyPayments();
      const payments = response.data || response.payments || response || [];
      setPendingPayments(Array.isArray(payments) ? payments : []);
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      setPendingPayments([]);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await rentalService.getMyRentals();
      // API returns: { success: true, data: [...] }
      const rentalsData = response.data || response.rentals || response || [];
      setRentals(Array.isArray(rentalsData) ? rentalsData : []);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      // Don't set error state for rentals, just log it
      setRentals([]);
    }
  };

  const fetchPendingOverdue = async () => {
    try {
      const response = await rentalService.getPendingOverduePayments();
      const data = response.data || response || [];
      // Update pending payments from this endpoint
      if (Array.isArray(data) && data.length > 0) {
        const allPayments = [];
        data.forEach(rental => {
          if (rental.pending_payments) {
            rental.pending_payments.forEach(payment => {
              allPayments.push({
                ...payment,
                rental_id: rental.rental_id,
                rental_items: rental.rental_items
              });
            });
          }
          if (rental.overdue_payments) {
            rental.overdue_payments.forEach(payment => {
              allPayments.push({
                ...payment,
                rental_id: rental.rental_id,
                rental_items: rental.rental_items,
                daysOverdue: payment.daysOverdue
              });
            });
          }
        });
        setPendingPayments(allPayments);
      }
    } catch (err) {
      console.error('Error fetching pending/overdue payments:', err);
    }
  };

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

            {/* Rentals Stat Card */}
            {rentals.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-teal-100 rounded-lg p-3">
                    <KeyIcon className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Active Rentals</p>
                    <p className="text-2xl font-bold text-gray-900">{rentals.filter(r => r.status === 'Active').length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Payments Stat Card */}
            {pendingPayments.filter(p => p.status !== 'paid').length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                    <CreditCardIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingPayments.filter(p => p.status !== 'paid').length}
                    </p>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs text-violet-600 hover:text-violet-700 mt-1"
                    >
                      View all →
                    </button>
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
              {['overview', 'property', 'furniture', 'services', 'contact', 'rentals', 'payments'].map((tab) => (
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
              {/* Quick Actions */}
              <div className="flex gap-4">
                <Link
                  to="/transactions"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                >
                  View All Transactions →
                </Link>
              </div>

              {/* Recent Rentals */}
              {rentals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Rentals</h2>
                  <div className="space-y-3">
                    {rentals.slice(0, 3).map((rental) => {
                      const rentalId = rental._id || rental.id;
                      return (
                        <div
                          key={rentalId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                Rental #{rentalId.slice(-6)}
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  rental.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  rental.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {rental.status}
                                </span>
                                <span>₹{rental.total_monthly_amount || 0}/month</span>
                                {rental.start_date && (
                                  <span>Started: {new Date(rental.start_date).toLocaleDateString()}</span>
                                )}
                              </div>
                              {rental.items && rental.items.length > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                  {rental.items.length} item{rental.items.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {rentals.length > 3 && (
                    <button
                      onClick={() => setActiveTab('rentals')}
                      className="mt-3 text-sm text-violet-600 hover:text-violet-700"
                    >
                      View all rentals →
                    </button>
                  )}
                </div>
              )}

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
                <h2 className="text-xl font-semibold text-gray-900">My Furniture Requests</h2>
                {furnitureRequests.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {furnitureRequests.length}
                  </span>
                )}
              </div>
              {furnitureRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Furniture</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {furnitureRequests.map((req) => {
                        const furnitureName = req.furniture_name || req.furniture_details?.name || req.furniture?.name || req.furniture_id || '-';
                        const furniturePhoto = req.furniture_details?.photos?.[0] || req.furniture?.photos?.[0] || req.furniture_photo;
                        const furnitureCategory = req.furniture_details?.category || req.furniture?.category;
                        const listingType = req.listing_type || req.furniture_details?.listing_type || req.furniture?.listing_type || '-';
                        const paymentStatus = req.payment_status || 'Pending';
                        const showPayButton = paymentStatus === 'Pending' && (req.status === 'Ordered' || req.status === 'Requested');
                        const orderData = paymentOrderData[req._id || req.id];
                        
                        return (
                          <tr key={req._id || req.id} className="hover:bg-gray-50">
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
                                  {req.scheduled_delivery_date && listingType === 'Rent' && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Delivery: {new Date(req.scheduled_delivery_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listingType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                {req.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {showPayButton && (
                                <div>
                                  {!orderData ? (
                                    <button
                                      onClick={() => handleFurniturePayment(req._id || req.id)}
                                      className="px-3 py-1 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 font-medium"
                                    >
                                      Pay Now
                                    </button>
                                  ) : (
                                    <RazorpayButton
                                      orderData={orderData}
                                      onSuccess={(response) => handleFurniturePaymentSuccess(req._id || req.id, response)}
                                      onError={(err) => setError(err.message || 'Payment failed')}
                                      buttonText="Pay Now"
                                      className="px-3 py-1 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 font-medium"
                                    />
                                  )}
                                </div>
                              )}
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

          {activeTab === 'rentals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Rentals</h2>
                {rentals.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {rentals.length} ({rentals.filter(r => r.status === 'Active').length} Active)
                  </span>
                )}
              </div>
              {rentals.length > 0 ? (
                <div className="space-y-4">
                  {rentals.map((rental) => {
                    const rentalId = rental._id || rental.id;
                    return (
                      <div
                        key={rentalId}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {rental.rental_id || `Rental #${rentalId.slice(-6)}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>
                                <strong>Status:</strong>{' '}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  rental.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  rental.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  rental.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {rental.status}
                                </span>
                              </span>
                              {rental.payment_summary && (
                                <>
                                  <span>
                                    <strong>Monthly Rent:</strong> ₹{rental.payment_summary.monthly_rent || rental.total_monthly_amount || 0}
                                  </span>
                                  {rental.payment_summary.pending_count > 0 && (
                                    <span className="text-yellow-600">
                                      <strong>Pending:</strong> {rental.payment_summary.pending_count} months (₹{rental.payment_summary.total_pending?.toLocaleString() || 0})
                                    </span>
                                  )}
                                  {rental.payment_summary.overdue_count > 0 && (
                                    <span className="text-red-600">
                                      <strong>Overdue:</strong> {rental.payment_summary.overdue_count} months (₹{rental.payment_summary.total_overdue?.toLocaleString() || 0})
                                    </span>
                                  )}
                                  {rental.payment_summary.paid_count > 0 && (
                                    <span className="text-green-600">
                                      <strong>Paid:</strong> {rental.payment_summary.paid_count} months (₹{rental.payment_summary.total_paid?.toLocaleString() || 0})
                                    </span>
                                  )}
                                </>
                              )}
                              {!rental.payment_summary && (
                                <>
                                  <span>
                                    <strong>Monthly Payment:</strong> ₹{rental.total_monthly_amount || 0}
                                  </span>
                                  {rental.total_deposit && (
                                    <span>
                                      <strong>Deposit:</strong> ₹{rental.total_deposit}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {rental.items && rental.items.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                            <div className="space-y-1">
                              {rental.items.map((item, idx) => (
                                <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                  <span>• {item.product_name} ({item.product_type || 'Furniture'})</span>
                                  <span>₹{item.monthly_price}/month {item.quantity > 1 && `x ${item.quantity}`}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          {rental.start_date && (
                            <div>
                              <strong>Start Date:</strong>{' '}
                              {new Date(rental.start_date).toLocaleDateString()}
                            </div>
                          )}
                          {rental.end_date && (
                            <div>
                              <strong>End Date:</strong>{' '}
                              {new Date(rental.end_date).toLocaleDateString()}
                            </div>
                          )}
                          {rental.customer_address && (
                            <div className="md:col-span-2">
                              <strong>Address:</strong>{' '}
                              {rental.customer_address.street ? 
                                `${rental.customer_address.street}, ${rental.customer_address.city}, ${rental.customer_address.state} ${rental.customer_address.zipcode}, ${rental.customer_address.country}` :
                                (typeof rental.customer_address === 'string' ? rental.customer_address : 'N/A')
                              }
                            </div>
                          )}
                        </div>

                        {rental.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <strong className="text-sm text-gray-700">Notes:</strong>
                            <p className="text-sm text-gray-600 mt-1">{rental.notes}</p>
                          </div>
                        )}

                        {rental.payment_records && rental.payment_records.length > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-gray-700">
                                Payment History ({rental.payment_records.length} {rental.payment_records.length === 1 ? 'month' : 'months'}):
                              </h4>
                              {rental.payment_summary && (
                                <span className="text-xs text-gray-500">
                                  Total Due: ₹{((rental.payment_summary.total_pending || 0) + (rental.payment_summary.total_overdue || 0))?.toLocaleString() || 0}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                              {rental.payment_records.map((payment, idx) => {
                                const [year, month] = payment.month?.split('-') || [];
                                const monthName = year && month 
                                  ? new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                                  : payment.month || 'N/A';
                                const isOverdue = payment.status === 'Overdue' || (payment.dueDate && new Date(payment.dueDate) < new Date() && payment.status !== 'Paid');
                                return (
                                  <div 
                                    key={idx} 
                                    className={`flex justify-between items-center text-sm p-2 rounded border ${
                                      payment.status === 'Paid' ? 'bg-green-50 border-green-200' : 
                                      isOverdue ? 'bg-red-50 border-red-200' :
                                      payment.status === 'Partial' ? 'bg-orange-50 border-orange-200' :
                                      'bg-yellow-50 border-yellow-200'
                                    }`}
                                  >
                                    <span className="font-medium text-gray-700">{monthName}</span>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                        isOverdue ? 'bg-red-100 text-red-800' :
                                        payment.status === 'Partial' ? 'bg-orange-100 text-orange-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {payment.status || 'Pending'}
                                      </span>
                                      <span className="text-xs text-gray-600">₹{payment.amount?.toLocaleString() || 0}</span>
                                      {isOverdue && payment.daysOverdue && (
                                        <span className="text-xs text-red-600">{payment.daysOverdue} days overdue</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <KeyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No rentals found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    If you have rentals, they will appear here once linked to your account.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pending Payments</h2>
                {pendingPayments.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {pendingPayments.filter(p => p.status !== 'paid').length} Pending
                  </span>
                )}
              </div>
              {pendingPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingPayments.map((payment) => (
                    <MonthlyPaymentCard
                      key={payment._id || payment.id}
                      payment={payment}
                      onPaymentSuccess={(response) => {
                        // Refresh payments after successful payment
                        fetchPendingPayments();
                        fetchRentals();
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending payments</p>
                  <p className="text-sm text-gray-400 mt-2">
                    All your payments are up to date.
                  </p>
                </div>
              )}
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

