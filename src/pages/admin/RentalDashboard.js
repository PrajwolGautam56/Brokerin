import { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import MonthlyCollectionView from './components/MonthlyCollectionView';

function RentalDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duesTab, setDuesTab] = useState('all');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalService.getRentalDashboard();
      setDashboardData(response.data || response);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
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
          Error: {error}
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

  const { summary, dues_breakdown, monthly_collection, order_status } = dashboardData;
  const allDues = dues_breakdown?.all_dues || [];
  const pendingDues = allDues.filter((d) => d.status === 'Pending');
  const overdueDues = allDues.filter((d) => d.status === 'Overdue');
  const visibleDues =
    duesTab === 'pending' ? pendingDues : duesTab === 'overdue' ? overdueDues : allDues;

  const groupedVisibleDues = Object.values(
    visibleDues.reduce((acc, due) => {
      const key = due.customer_email || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          customer_name: due.customer_name,
          customer_email: due.customer_email,
          customer_phone: due.customer_phone,
          total: 0,
          pending: 0,
          overdue: 0,
          dues: []
        };
      }
      acc[key].dues.push(due);
      acc[key].total += Number(due.amount || 0);
      if (due.status === 'Pending') acc[key].pending += Number(due.amount || 0);
      if (due.status === 'Overdue') acc[key].overdue += Number(due.amount || 0);
      return acc;
    }, {})
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rental Management Dashboard</h1>
        <p className="text-gray-600">Comprehensive overview of rental operations and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Rented Items</h3>
          <p className="text-2xl font-bold text-gray-900">{summary?.total_rented_items || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <KeyIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Active Rentals</h3>
          <p className="text-2xl font-bold text-gray-900">{summary?.total_active_rentals || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <CurrencyDollarIcon className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">₹{summary?.total_monthly_revenue?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <CurrencyDollarIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Deposits</h3>
          <p className="text-2xl font-bold text-gray-900">₹{summary?.total_deposits?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">₹{summary?.total_paid_amount?.toLocaleString() || 0}</p>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className="flex justify-center mb-2">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Dues</h3>
          <p className="text-2xl font-bold text-yellow-600">₹{summary?.total_due_amount?.toLocaleString() || 0}</p>
          <small className="text-xs text-gray-500 block mt-1">
            {summary?.pending_count || 0} Pending, {summary?.overdue_count || 0} Overdue
          </small>
        </div>
      </div>

      {/* Order Status Statistics */}
      {order_status && order_status.stats && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(order_status.stats).map(([status, count]) => {
              const statusColors = {
                'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                'Processing': 'bg-blue-100 text-blue-800 border-blue-300',
                'Confirmed': 'bg-green-100 text-green-800 border-green-300',
                'Out for Delivery': 'bg-purple-100 text-purple-800 border-purple-300',
                'Delivered': 'bg-green-100 text-green-800 border-green-300',
                'Cancelled': 'bg-red-100 text-red-800 border-red-300',
                'Refunded': 'bg-gray-100 text-gray-800 border-gray-300'
              };
              return (
                <div key={status} className={`bg-white rounded-lg shadow p-4 border-2 ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                  <div className="text-sm font-medium mb-1">{status}</div>
                  <div className="text-2xl font-bold">{count || 0}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Category-First Dues View */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dues Breakdown (Categorized)</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDuesTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                duesTab === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All ({allDues.length})
            </button>
            <button
              onClick={() => setDuesTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                duesTab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pending ({pendingDues.length})
            </button>
            <button
              onClick={() => setDuesTab('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                duesTab === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Overdue ({overdueDues.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
            <div className="text-xs text-violet-700">Visible Dues Amount</div>
            <div className="text-xl font-bold text-violet-900">
              ₹{visibleDues.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-xs text-yellow-700">Pending Amount</div>
            <div className="text-xl font-bold text-yellow-900">
              ₹{pendingDues.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-xs text-red-700">Overdue Amount</div>
            <div className="text-xl font-bold text-red-900">
              ₹{overdueDues.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {groupedVisibleDues.length === 0 ? (
            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border">No dues in this category.</div>
          ) : (
            groupedVisibleDues.map((customer) => (
              <div key={customer.customer_email} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{customer.customer_name || 'N/A'}</div>
                    <div className="text-xs text-gray-600">{customer.customer_email}</div>
                    <div className="text-xs text-gray-600">{customer.customer_phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">₹{customer.total.toLocaleString()}</div>
                    <div className="text-xs text-yellow-700">Pending: ₹{customer.pending.toLocaleString()}</div>
                    <div className="text-xs text-red-700">Overdue: ₹{customer.overdue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleDues.map((due, idx) => (
                <tr key={`${due.rental_id}-${due.month}-${idx}`}>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{due.customer_name}</div>
                    <div className="text-xs text-gray-500">{due.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{due.month_name || due.month}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{Number(due.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        due.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {due.status}
                      {due.daysOverdue ? ` (${due.daysOverdue}d)` : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Collection */}
      {monthly_collection && monthly_collection.length > 0 && (
        <div className="mb-6">
          <MonthlyCollectionView collection={monthly_collection} />
        </div>
      )}
    </div>
  );
}

export default RentalDashboard;

