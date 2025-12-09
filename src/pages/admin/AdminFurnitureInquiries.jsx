import React, { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import api from '../../axiosConfig';
import logger from '../../utils/logger';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/priceFormatter';

function AdminFurnitureInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [cartOrders, setCartOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewType, setViewType] = useState('all'); // 'all', 'inquiries', 'orders'
  const inquiriesPerPage = 20;

  useEffect(() => {
    fetchData();
  }, [currentPage, filterStatus, searchQuery, viewType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Only fetch cart orders (rentals) - no inquiries
      await fetchCartOrders();
    } catch (error) {
      logger.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: inquiriesPerPage
      });

      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/api/furniture-forms?${params.toString()}`);
      logger.log('Inquiries response:', response.data);

      const inquiriesData = response.data.data || response.data.requests || response.data || [];
      const pagination = response.data.pagination || {};

      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
      setTotalInquiries(pagination.total || inquiriesData.length);
      setTotalPages(pagination.totalPages || Math.ceil((pagination.total || inquiriesData.length) / inquiriesPerPage));
    } catch (error) {
      logger.error('Error fetching furniture inquiries:', error);
      toast.error('Failed to load furniture inquiries');
      setInquiries([]);
    }
  };

  const fetchCartOrders = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: inquiriesPerPage
      };

      if (filterStatus) filters.order_status = filterStatus;
      if (searchQuery) filters.search = searchQuery;

      const response = await rentalService.getAllRentals(filters);
      logger.log('Cart orders response:', response);

      // Handle different response structures
      let ordersData = [];
      if (response.success && response.data) {
        ordersData = Array.isArray(response.data) ? response.data : [];
      } else if (response.data) {
        ordersData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response.rentals) {
        ordersData = Array.isArray(response.rentals) ? response.rentals : [];
      }

      logger.log('All orders before filtering:', ordersData);
      if (ordersData.length > 0) {
        logger.log('Sample order structure:', ordersData[0]);
        logger.log('Sample order items:', ordersData[0].items);
        if (ordersData[0].items && ordersData[0].items.length > 0) {
          logger.log('Sample item structure:', ordersData[0].items[0]);
        }
      }

      // Filter for RENT orders only (listing_type = 'Rent' or all items have listing_type = 'Rent')
      const filteredOrders = ordersData.filter(order => {
        // Check if order has items
        if (order.items && order.items.length > 0) {
          // Check each item's listing_type
          const allItemsAreRent = order.items.every(item => {
            const listingType = item.listing_type || item.listingType || item.type;
            logger.log('Item listing_type check:', { 
              listing_type: item.listing_type, 
              listingType: item.listingType, 
              type: item.type,
              result: listingType === 'Rent' || listingType === 'rent' || listingType === 'Rental'
            });
            return listingType === 'Rent' || listingType === 'rent' || listingType === 'Rental';
          });
          logger.log('Order filter result (items):', { orderId: order.rental_id, allItemsAreRent });
          return allItemsAreRent;
        }
        // If no items, check order-level listing_type
        const orderListingType = order.listing_type || order.listingType;
        const isRentOrder = orderListingType === 'Rent' || orderListingType === 'rent' || orderListingType === 'Rental';
        logger.log('Order filter result (no items):', { orderId: order.rental_id, orderListingType, isRentOrder });
        return isRentOrder;
      });

      logger.log('Filtered RENT orders:', filteredOrders);
      logger.log('Total orders before filter:', ordersData.length);
      logger.log('Total orders after filter:', filteredOrders.length);

      // Temporarily show all orders if filter returns empty (for debugging)
      // Check browser console to see the actual order structure
      if (filteredOrders.length === 0 && ordersData.length > 0) {
        logger.warn('No RENT orders found after filtering. Temporarily showing ALL orders for debugging.');
        logger.warn('Check console logs above to see order structure and adjust filter accordingly.');
        // Temporarily show all orders - remove this after fixing the filter
        ordersData = ordersData;
      } else {
        ordersData = filteredOrders;
      }

      // Transform orders to inquiry-like format for display
      const transformedOrders = ordersData.map(order => ({
        _id: order._id,
        type: 'order', // Mark as order
        source: 'cart', // Mark source as cart
        createdAt: order.order_placed_at || order.createdAt,
        name: order.customer_name,
        customer_name: order.customer_name,
        email: order.customer_email,
        customer_email: order.customer_email,
        phoneNumber: order.customer_phone,
        customer_phone: order.customer_phone,
        status: order.order_status || 'Pending',
        order_status: order.order_status,
        rental_id: order.rental_id,
        items: order.items || [],
        total_amount: (order.total_monthly_amount || 0) + (order.total_deposit || 0) + (order.delivery_charge || 0),
        message: `Order placed via cart checkout. Order ID: ${order.rental_id}`
      }));

      setCartOrders(transformedOrders);
    } catch (error) {
      logger.error('Error fetching cart orders:', error);
      toast.error('Failed to load cart orders');
      setCartOrders([]);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await api.put(
        `/api/furniture-forms/${inquiryId}`,
        { status: newStatus }
      );
      
      toast.success(`Inquiry status updated to ${newStatus}`);
      fetchData();
      if (selectedInquiry?._id === inquiryId) {
        setShowDetailsModal(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      logger.error('Error updating inquiry status:', error);
      toast.error(error.response?.data?.message || 'Failed to update inquiry status');
    }
  };

  const handleDelete = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await api.delete(`/api/furniture-forms/${inquiryId}`);
      
      toast.success('Inquiry deleted successfully');
      fetchData();
    } catch (error) {
      logger.error('Error deleting inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this rental order? This action cannot be undone.')) {
      return;
    }

    try {
      await rentalService.deleteRental(orderId);
      toast.success('Rental order deleted successfully');
      fetchData();
      if (selectedInquiry?._id === orderId) {
        setShowDetailsModal(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      logger.error('Error deleting rental order:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete rental order');
    }
  };

  const viewInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Converted': 'bg-purple-100 text-purple-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    return type === 'rent' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Furniture Rental Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer rental orders from cart checkout</p>
        
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, email, phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Approved">Approved</option>
              <option value="Converted">Converted to Order</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading data...</p>
        </div>
      ) : cartOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rental Orders Found</h3>
          <p className="text-gray-600">No rental orders match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Furniture</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Display cart orders */}
                  {cartOrders.map((order) => (
                    <tr key={`order-${order._id}`} className="hover:bg-gray-50 bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-1">Cart Order</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.name || order.customer_name}</div>
                          <div className="text-gray-500">{order.email || order.customer_email}</div>
                          <div className="text-gray-500">{order.phoneNumber || order.customer_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.items?.length > 0 
                              ? `${order.items.length} item(s)` 
                              : 'Multiple items'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Order ID: {order.rental_id}
                          </div>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-500 mt-1">
                              • {item.product_name || item.name} (Qty: {item.quantity || 1})
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-xs text-gray-500">+ {order.items.length - 2} more</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-700">
                          ORDER
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status || order.status)}`}>
                          {order.order_status || order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewInquiryDetails(order)}
                          className="text-violet-600 hover:text-violet-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-md">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * inquiriesPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * inquiriesPerPage, cartOrders.length)}</span> of{' '}
                    <span className="font-medium">{cartOrders.length}</span> rental orders
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-violet-50 border-violet-500 text-violet-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Inquiry Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedInquiry.type === 'order' ? 'Order Details' : 'Inquiry Details'}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Inquiry Info */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{selectedInquiry.type === 'order' ? 'Order Date' : 'Inquiry Date'}</p>
                    <p className="font-semibold">{new Date(selectedInquiry.createdAt || selectedInquiry.created_at).toLocaleString()}</p>
                    {selectedInquiry.type === 'order' && selectedInquiry.rental_id && (
                      <p className="text-xs text-gray-500 mt-1">Order ID: {selectedInquiry.rental_id}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInquiry.order_status || selectedInquiry.status)}`}>
                      {selectedInquiry.order_status || selectedInquiry.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p className="font-medium">{selectedInquiry.name || selectedInquiry.customer_name}</p>
                  <p className="text-gray-600">{selectedInquiry.email || selectedInquiry.customer_email}</p>
                  <p className="text-gray-600">{selectedInquiry.phoneNumber || selectedInquiry.phone || selectedInquiry.customer_phone}</p>
                </div>

                {/* Order Items or Furniture Info */}
                {selectedInquiry.type === 'order' && selectedInquiry.items ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {selectedInquiry.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.product_name || item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                          </div>
                          <p className="text-sm font-semibold text-violet-600">
                            {item.monthly_price ? `₹${item.monthly_price}/mo` : 'Price on request'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-violet-600">₹{selectedInquiry.total_amount?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                ) : (selectedInquiry.furniture || selectedInquiry.furniture_name) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Furniture Interest</h3>
                    <p className="font-medium">{selectedInquiry.furniture?.name || selectedInquiry.furniture_name}</p>
                    {selectedInquiry.furniture?.furniture_id && (
                      <p className="text-sm text-gray-600">ID: {selectedInquiry.furniture.furniture_id}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Type: <span className="font-medium">{(selectedInquiry.type || selectedInquiry.inquiry_type || 'rent').toUpperCase()}</span>
                    </p>
                  </div>
                )}

                {/* Message */}
                {(selectedInquiry.message || selectedInquiry.notes) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Message</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message || selectedInquiry.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedInquiry.type !== 'order' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Update Status</h3>
                  <div className="flex gap-3 flex-wrap">
                    <select
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      defaultValue={selectedInquiry.status}
                      id="inquiry-status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Approved">Approved</option>
                      <option value="Converted">Converted to Order</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      onClick={() => {
                        const newStatus = document.getElementById('inquiry-status-select').value;
                        handleStatusUpdate(selectedInquiry._id, newStatus);
                      }}
                      className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              )}
              
              {selectedInquiry.type === 'order' && (
                <div className="mb-6">
                  <a
                    href="/admin/orders"
                    className="block w-full px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-center font-semibold"
                  >
                    Manage Order in Orders Page
                  </a>
                </div>
              )}

              {/* Follow-up Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => {
                    if (selectedInquiry.type === 'order') {
                      handleDeleteOrder(selectedInquiry._id);
                    } else {
                      handleDelete(selectedInquiry._id);
                    }
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete {selectedInquiry.type === 'order' ? 'Order' : 'Inquiry'}
                </button>
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedInquiry.email || selectedInquiry.customer_email}?subject=Regarding Your Furniture Inquiry`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Email Customer
                  </a>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFurnitureInquiries;

