import { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import DuesBreakdownView from './components/DuesBreakdownView';
import MonthlyCollectionView from './components/MonthlyCollectionView';

function RentalDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDuesDetails, setShowDuesDetails] = useState(false);

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
          className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowDuesDetails(!showDuesDetails)}
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

      {/* Dues Details (Expandable) */}
      {showDuesDetails && dues_breakdown && (
        <div className="mb-6">
          <DuesBreakdownView 
            totalAmount={dues_breakdown.total_amount}
            byCustomer={dues_breakdown.by_customer || []}
            allDues={dues_breakdown.all_dues || []}
            onClose={() => setShowDuesDetails(false)}
          />
        </div>
      )}

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

