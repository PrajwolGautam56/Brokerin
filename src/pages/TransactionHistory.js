import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import DeliveryStatusBadge from '../components/transactions/DeliveryStatusBadge';
import PaymentStatusBadge from '../components/transactions/PaymentStatusBadge';
import { TruckIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    transaction_type: '',
    payment_status: '',
    delivery_status: ''
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.getAllTransactions({
        ...filters,
        page: pagination.page,
        limit: 10
      });
      setTransactions(response.transactions || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewInvoice = async (transactionId, paymentId = null) => {
    try {
      const blob = await transactionService.getInvoice(transactionId, paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${transactionId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders & Rentals</h1>
          <p className="text-gray-600">View your transaction history and track deliveries</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.transaction_type}
                onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">All Types</option>
                <option value="Sale">Purchase</option>
                <option value="Rent">Rental</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
              <select
                value={filters.payment_status}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">All Payments</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery</label>
              <select
                value={filters.delivery_status}
                onChange={(e) => handleFilterChange('delivery_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">All Deliveries</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id || transaction.transaction_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {transaction.furniture_id?.photos?.[0] && (
                        <img
                          src={transaction.furniture_id.photos[0]}
                          alt={transaction.furniture_id.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {transaction.furniture_id?.name || 'Furniture Item'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Transaction ID</p>
                            <p className="font-medium">{transaction.transaction_id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Type</p>
                            <p className="font-medium">{transaction.transaction_type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Amount</p>
                            <p className="font-medium text-violet-600">₹{transaction.total_amount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="flex flex-wrap gap-2">
                      <PaymentStatusBadge
                        status={transaction.payment_status}
                        totalAmount={transaction.total_amount}
                        totalPaid={transaction.total_paid}
                        remainingAmount={transaction.remaining_amount}
                      />
                      <DeliveryStatusBadge status={transaction.delivery_status} />
                    </div>
                    {transaction.delivery_tracking_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TruckIcon className="w-4 h-4" />
                        <span>Tracking: {transaction.delivery_tracking_number}</span>
                      </div>
                    )}
                    {transaction.invoice_number && (
                      <button
                        onClick={() => handleViewInvoice(transaction._id || transaction.transaction_id)}
                        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        View Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-sm text-gray-400 mt-2">
              Your orders and rentals will appear here
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;

