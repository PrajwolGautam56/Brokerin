import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { rentalService } from '../services/rentalService';
import { formatPrice } from '../utils/priceFormatter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Try orderService first, then fallback to rentalService
      let orderData = null;
      try {
        const response = await orderService.getOrderById(id);
        orderData = response.data || response;
      } catch (err) {
        logger.warn('OrderService failed, trying rentalService:', err);
        // Fallback to rentalService
        const rentalResponse = await rentalService.getRentalById(id);
        orderData = rentalResponse.data || rentalResponse;
      }
      
      logger.log('Order data fetched:', orderData);
      setOrder(orderData);
    } catch (err) {
      logger.error('Failed to fetch order:', err);
      setError(err.message || 'Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await orderService.cancelOrder(id, reason);
      fetchOrder(); // Refresh order data
      alert('Order cancelled successfully');
    } catch (err) {
      logger.error('Failed to cancel order:', err);
      alert(err.message || 'Failed to cancel order');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/furniture')}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'Pending', label: 'Order Placed', icon: '📋' },
    { key: 'Processing', label: 'Processing', icon: '⚙️' },
    { key: 'Confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'Delivered', label: 'Delivered', icon: '📦' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.order_status);
  const isCancelled = order.order_status === 'Cancelled';
  const canCancel = ['Pending', 'Processing'].includes(order.order_status);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-violet-600 hover:text-violet-700 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-1">Order ID: {order.rental_id}</p>
            </div>
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>

              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">Order Cancelled</h3>
                  <p className="text-gray-600">This order has been cancelled</p>
                </div>
              ) : (
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Timeline Line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute left-6 top-12 w-0.5 h-full ${
                            isCompleted ? 'bg-violet-600' : 'bg-gray-200'
                          }`} />
                        )}

                        {/* Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          isCompleted 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step.icon}
                        </div>

                        {/* Content */}
                        <div className={`pb-8 ${isCurrent ? '' : ''}`}>
                          <h3 className={`font-semibold ${isCurrent ? 'text-violet-600' : 'text-gray-900'}`}>
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <p className="text-sm text-gray-600 mt-1">Current status</p>
                          )}
                          {isCompleted && !isCurrent && (
                            <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.photos?.[0] ? (
                        <img src={item.photos[0]} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <div className="mt-2 space-y-1">
                        {item.monthly_price && (
                          <p className="text-violet-600 font-semibold">
                            {formatPrice(item.monthly_price)}/month
                          </p>
                        )}
                        {item.deposit > 0 && (
                          <p className="text-sm text-gray-600">
                            Deposit: {formatPrice(item.deposit)}
                          </p>
                        )}
                        {item.listing_type && (
                          <p className="text-xs text-gray-500">
                            Type: {item.listing_type}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History & Schedule */}
            {order.payment_records && order.payment_records.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History & Schedule</h2>
                <div className="space-y-3">
                  {order.payment_records.map((payment, idx) => {
                    const isOverdue = payment.status === 'Overdue';
                    const isPaid = payment.status === 'Paid';
                    const isPending = payment.status === 'Pending';
                    
                    return (
                      <div 
                        key={payment._id || idx} 
                        className={`border rounded-lg p-4 ${
                          isOverdue ? 'border-red-200 bg-red-50' :
                          isPaid ? 'border-green-200 bg-green-50' :
                          'border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {new Date(payment.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(payment.amount)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isPaid ? 'bg-green-100 text-green-800' :
                              isOverdue ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        {isOverdue && payment.daysUntilDue && (
                          <p className="text-sm text-red-600 mt-2">
                            {Math.abs(payment.daysUntilDue)} days overdue
                          </p>
                        )}
                        {isPending && payment.daysUntilDue && payment.daysUntilDue > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            Due in {payment.daysUntilDue} days
                          </p>
                        )}
                        {payment.paidAt && (
                          <p className="text-sm text-green-600 mt-2">
                            Paid on: {new Date(payment.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Payment Summary */}
                {order.payment_summary && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Monthly Rent</p>
                        <p className="font-bold text-lg">{formatPrice(order.payment_summary.monthly_rent || order.total_monthly_amount)}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="font-bold text-lg text-yellow-600">{formatPrice(order.payment_summary.total_pending || 0)}</p>
                        <p className="text-xs text-gray-500">{order.payment_summary.pending_count || 0} payments</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Overdue</p>
                        <p className="font-bold text-lg text-red-600">{formatPrice(order.payment_summary.total_overdue || 0)}</p>
                        <p className="text-xs text-gray-500">{order.payment_summary.overdue_count || 0} payments</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="font-bold text-lg text-green-600">{formatPrice(order.payment_summary.total_paid || 0)}</p>
                        <p className="text-xs text-gray-500">{order.payment_summary.paid_count || 0} payments</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rental Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rental Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Rental Status</p>
                  <p className="font-semibold text-gray-900">{order.status || 'Active'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-semibold text-gray-900">{order.order_status || 'Pending'}</p>
                </div>
                {order.start_date && (
                  <div>
                    <p className="text-sm text-gray-600">Rental Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {order.end_date && (
                  <div>
                    <p className="text-sm text-gray-600">Rental End Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {order.rental_duration && (
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{order.rental_duration} months</p>
                  </div>
                )}
                {order.order_placed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Order Placed</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.order_placed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold">{formatPrice(order.total_monthly_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold">{formatPrice(order.total_deposit)}</span>
                </div>
                {order.delivery_charge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-semibold">{formatPrice(order.delivery_charge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-violet-600">
                    {formatPrice((order.total_monthly_amount || 0) + (order.total_deposit || 0) + (order.delivery_charge || 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Placed:</span>
                  <span className="font-medium">
                    {new Date(order.order_placed_at || order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {order.start_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rental Started:</span>
                    <span className="font-medium">
                      {new Date(order.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.delivery_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-medium">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivered On:</span>
                    <span className="font-medium">
                      {new Date(order.delivered_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.rental_duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{order.rental_duration} months</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Status:</span>
                  <span className={`font-medium ${
                    order.status === 'Active' ? 'text-green-600' :
                    order.status === 'Completed' ? 'text-gray-600' :
                    'text-yellow-600'
                  }`}>
                    {order.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-600">
                  {typeof order.customer_address === 'string' 
                    ? order.customer_address
                    : `${order.customer_address?.street || ''}, ${order.customer_address?.city || ''}, ${order.customer_address?.state || ''} ${order.customer_address?.zipcode || ''}`
                  }
                </p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-sm text-gray-600">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.customer_email}</p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>

              <button
                onClick={() => navigate('/furniture')}
                className="w-full mt-6 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;

