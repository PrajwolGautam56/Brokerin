import { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
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

  const { summary, dues_breakdown, monthly_collection } = dashboardData;
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
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rental Dues Dashboard</h1>
        <p className="text-gray-600">Simple monthly dues tracking for payment follow-ups</p>
      </div>

      {/* Summary Cards - focused on collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Dues</h3>
          <p className="text-2xl font-bold text-amber-600">₹{summary?.total_due_amount?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">₹{summary?.total_pending_amount?.toLocaleString() || 0}</p>
          <small className="text-xs text-gray-500 block mt-1">{summary?.pending_count || 0} records</small>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Overdue</h3>
          <p className="text-2xl font-bold text-red-600">₹{summary?.total_overdue_amount?.toLocaleString() || 0}</p>
          <small className="text-xs text-gray-500 block mt-1">{summary?.overdue_count || 0} records</small>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">₹{summary?.total_paid_amount?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Category-first dues view */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Customer Dues List</h2>
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

        <div className="space-y-3">
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
                    <div className="text-lg font-bold text-gray-900">₹{customer.total.toLocaleString()}</div>
                    <div className="text-xs text-yellow-700">Pending: ₹{customer.pending.toLocaleString()}</div>
                    <div className="text-xs text-red-700">Overdue: ₹{customer.overdue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
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

