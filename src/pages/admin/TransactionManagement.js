import { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import DeliveryStatusBadge from '../../components/transactions/DeliveryStatusBadge';
import PaymentStatusBadge from '../../components/transactions/PaymentStatusBadge';
import PaymentModal from './components/PaymentModal';
import DeliveryStatusModal from './components/DeliveryStatusModal';
import { 
  CreditCardIcon, 
  TruckIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline';

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    transaction_type: '',
    payment_status: '',
    delivery_status: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.getAllTransactions({
        ...filters,
        page: pagination.page,
        limit: 20
      });
      setTransactions(response.transactions || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (paymentData) => {
    try {
      const response = await transactionService.recordPayment(
        selectedTransaction._id || selectedTransaction.transaction_id,
        paymentData
      );
      setSuccess(`Payment recorded! Invoice ${response.invoiceNumber} sent to customer.`);
      setShowPaymentModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    }
  };

  const handleUpdateDelivery = async (statusData) => {
    try {
      await transactionService.updateDeliveryStatus(
        selectedTransaction._id || selectedTransaction.transaction_id,
        statusData
      );
      setSuccess('Delivery status updated successfully!');
      setShowDeliveryModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (err) {
      setError(err.message || 'Failed to update delivery status');
    }
  };

  const handleViewInvoice = async (transactionId, paymentId = null) => {
    try {
      const blob = await transactionService.getInvoice(transactionId, paymentId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to view invoice: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Management</h1>
        <p className="text-gray-600">Manage payments, deliveries, and track all transactions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              onChange={(e) => setFilters(prev => ({ ...prev, payment_status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              onChange={(e) => setFilters(prev => ({ ...prev, delivery_status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.furniture_id?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.transaction_id}</div>
                      <div className="text-xs text-gray-500">{transaction.transaction_type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.user_id?.fullName || transaction.user_id?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">{transaction.user_id?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{transaction.total_amount?.toLocaleString() || 0}
                    </div>
                    {transaction.remaining_amount > 0 && (
                      <div className="text-xs text-red-600">
                        ₹{transaction.remaining_amount.toLocaleString()} remaining
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PaymentStatusBadge
                      status={transaction.payment_status}
                      totalAmount={transaction.total_amount}
                      totalPaid={transaction.total_paid}
                      remainingAmount={transaction.remaining_amount}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <DeliveryStatusBadge status={transaction.delivery_status} />
                    {transaction.delivery_tracking_number && (
                      <div className="text-xs text-gray-500 mt-1">
                        Track: {transaction.delivery_tracking_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {transaction.payment_status !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowPaymentModal(true);
                          }}
                          className="text-violet-600 hover:text-violet-700"
                          title="Record Payment"
                        >
                          <CreditCardIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDeliveryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Update Delivery"
                      >
                        <TruckIcon className="w-5 h-5" />
                      </button>
                      {transaction.invoice_number && (
                        <button
                          onClick={() => handleViewInvoice(transaction._id || transaction.transaction_id)}
                          className="text-green-600 hover:text-green-700"
                          title="View Invoice"
                        >
                          <DocumentTextIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTransaction && (
        <PaymentModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={handleRecordPayment}
        />
      )}

      {/* Delivery Status Modal */}
      {showDeliveryModal && selectedTransaction && (
        <DeliveryStatusModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={handleUpdateDelivery}
        />
      )}
    </div>
  );
}

export default TransactionManagement;

