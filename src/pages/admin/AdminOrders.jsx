import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { formatPrice } from '../../utils/priceFormatter';
import logger from '../../utils/logger';
import toast from 'react-hot-toast';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const ordersPerPage = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Verify token exists
      const token = localStorage.getItem('token');
      if (!token) {
        logger.error('No authentication token found');
        toast.error('Please login to view orders');
        return;
      }
      logger.log('Token present:', token.substring(0, 20) + '...');
      
      const filters = {
        page: currentPage,
        limit: ordersPerPage
      };

      if (filterStatus) filters.order_status = filterStatus;
      if (searchQuery) filters.search = searchQuery;

      logger.log('Fetching orders with filters:', filters);
      logger.log('Using endpoint: /api/orders');
      
      const response = await orderService.getAllOrders(filters);
      
      logger.log('Orders API response:', response);
      logger.log('Response type:', typeof response);
      logger.log('Is array:', Array.isArray(response));
      logger.log('Has data property:', !!response.data);
      logger.log('Has success property:', !!response.success);
      
      // Handle different response structures
      let ordersData = [];
      let pagination = {};
      
      if (response.success && response.data) {
        // Format: { success: true, data: [...], pagination: {...} }
        ordersData = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
      } else if (response.data) {
        // Format: { data: [...], pagination: {...} }
        ordersData = Array.isArray(response.data) ? response.data : [];
        pagination = response.pagination || {};
      } else if (Array.isArray(response)) {
        // Format: [...]
        ordersData = response;
      } else if (response.rentals) {
        // Format: { rentals: [...], pagination: {...} }
        ordersData = Array.isArray(response.rentals) ? response.rentals : [];
        pagination = response.pagination || {};
      }

      logger.log('All orders before filtering:', ordersData);
      if (ordersData.length > 0) {
        logger.log('Sample order structure:', ordersData[0]);
        logger.log('Sample order items:', ordersData[0].items);
        if (ordersData[0].items && ordersData[0].items.length > 0) {
          logger.log('Sample item structure:', ordersData[0].items[0]);
        }
      }

      // Orders from Order API are already cart orders (separate collection)
      // No need to filter by order_source
      
      logger.log('Pagination:', pagination);

      setOrders(ordersData);
      setTotalOrders(pagination.total || ordersData.length || 0);
      setTotalPages(pagination.totalPages || Math.ceil((pagination.total || ordersData.length || 0) / ordersPerPage) || 1);
    } catch (error) {
      logger.error('Error fetching orders:', error);
      logger.error('Error details:', error.response?.data || error.message);
      logger.error('Error status:', error.response?.status);
      logger.error('Error endpoint:', '/api/orders');
      
      // Provide helpful error messages
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Orders endpoint not found. Please check API configuration.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to load orders');
      }
      
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, additionalData = {}) => {
    try {
      await orderService.updateOrderStatus(
        orderId,
        newStatus,
        additionalData.delivery_date || null,
        additionalData.notes || null
      );
      
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setShowDetailsModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      logger.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update order status');
    }
  };

  const handleQuickAction = async (orderId, action) => {
    try {
      switch (action) {
        case 'confirm':
          await orderService.confirmOrder(orderId);
          toast.success('Order confirmed successfully');
          break;
        case 'out-for-delivery':
          const deliveryDate = prompt('Enter delivery date (YYYY-MM-DD):');
          if (!deliveryDate) return;
          await orderService.markOutForDelivery(orderId, deliveryDate);
          toast.success('Order marked as out for delivery');
          break;
        case 'delivered':
          await orderService.markDelivered(orderId);
          toast.success('Order marked as delivered');
          break;
        default:
          return;
      }

      fetchOrders();
    } catch (error) {
      logger.error('Error performing quick action:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await orderService.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setShowDetailsModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      logger.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete order');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buy Orders Management</h1>
        <p className="text-gray-600 mt-1">Manage customer purchase orders from cart checkout</p>
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
              placeholder="Order ID, customer name, email..."
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
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
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

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600">No orders match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.order_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-gray-500">{order.customer_email}</div>
                          <div className="text-gray-500">{order.customer_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.items?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice((order.total_monthly_amount || 0) + (order.total_deposit || 0) + (order.delivery_charge || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.order_placed_at || order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-violet-600 hover:text-violet-900 mr-3"
                        >
                          View Details
                        </button>
                        {order.order_status === 'Pending' && (
                          <button
                            onClick={() => handleQuickAction(order._id, 'confirm')}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Confirm
                          </button>
                        )}
                        {order.order_status === 'Confirmed' && (
                          <button
                            onClick={() => handleQuickAction(order._id, 'out-for-delivery')}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            Ship
                          </button>
                        )}
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
                    Showing <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * ordersPerPage, totalOrders)}</span> of{' '}
                    <span className="font-medium">{totalOrders}</span> orders
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.order_placed_at || selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{selectedOrder.payment_method || 'COD'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600">{selectedOrder.customer_email}</p>
                  <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                  <p className="text-gray-600 mt-2">
                    {typeof selectedOrder.customer_address === 'string'
                      ? selectedOrder.customer_address
                      : `${selectedOrder.customer_address?.street || ''}, ${selectedOrder.customer_address?.city || ''}, ${selectedOrder.customer_address?.state || ''} ${selectedOrder.customer_address?.zipcode || ''}`}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.photos?.[0] ? (
                          <img src={item.photos[0]} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-violet-600 font-semibold">{formatPrice(item.monthly_price)}/month</p>
                        {item.deposit > 0 && (
                          <p className="text-sm text-gray-600">Deposit: {formatPrice(item.deposit)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.total_monthly_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.total_deposit)}</span>
                  </div>
                  {selectedOrder.delivery_charge > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.delivery_charge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-violet-600">
                      {formatPrice((selectedOrder.total_monthly_amount || 0) + (selectedOrder.total_deposit || 0) + (selectedOrder.delivery_charge || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
                <div className="flex gap-3 flex-wrap">
                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    defaultValue={selectedOrder.order_status}
                    id="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                  <button
                    onClick={() => {
                      const newStatus = document.getElementById('status-select').value;
                      handleStatusUpdate(selectedOrder._id, newStatus);
                    }}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete Order
                </button>
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
      )}
    </div>
  );
}

export default AdminOrders;

