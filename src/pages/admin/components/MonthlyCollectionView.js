import { useState } from 'react';
import { rentalService } from '../../../services/rentalService';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import logger from '../../../utils/logger';

function MonthlyCollectionView({ collection }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthDetails, setMonthDetails] = useState(null);
  const [duesDetails, setDuesDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthDetails = async (month) => {
    if (selectedMonth === month && monthDetails && duesDetails) {
      setSelectedMonth(null);
      setMonthDetails(null);
      setDuesDetails(null);
      return;
    }

    try {
      setLoading(true);
      // Use the new endpoint for specific month paid collection details
      const response = await rentalService.getMonthlyCollectionDetails(month);
      const paidData = response.data || response;

      // Also fetch pending/overdue dues for this month
      const duesResponse = await rentalService.getDuesBreakdown({ month, status: 'all' });
      const duesData = duesResponse.data || duesResponse;

      setMonthDetails(paidData);
      setDuesDetails(duesData);
      setSelectedMonth(month);
    } catch (err) {
      logger.error('Error fetching month details:', err);
      alert('Failed to fetch month details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!collection || collection.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Collection Records</h2>
        <p className="text-gray-500 text-center py-8">No collection records available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Payment Tracking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {collection.map((month, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            onClick={() => fetchMonthDetails(month.month)}
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-5 h-5 text-violet-600" />
              <h3 className="font-semibold text-gray-900">{month.month_name || month.month}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-violet-50 p-2 rounded">
                <span className="text-sm text-gray-600">Collected:</span>
                <span className="text-sm font-bold text-violet-600">
                  ₹{month.total_collected?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">Payments:</span>
                <span className="text-sm font-medium text-gray-900">{month.payments_count || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{month.average_payment?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Month Details */}
      {selectedMonth && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : monthDetails ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthDetails.month_name || monthDetails.month || selectedMonth}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMonth(null);
                      setMonthDetails(null);
                      setDuesDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {duesDetails && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
                      <div className="text-xl font-bold text-yellow-700">
                        ₹{(duesDetails.summary?.total_pending_amount || duesDetails.total_pending || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Overdue Amount</div>
                      <div className="text-xl font-bold text-red-700">
                        ₹{(duesDetails.summary?.total_overdue_amount || duesDetails.total_overdue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Dues</div>
                      <div className="text-xl font-bold text-orange-700">
                        ₹{(duesDetails.summary?.total_due_amount || duesDetails.total_amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {duesDetails.all_dues && duesDetails.all_dues.length > 0 ? (
                    <div className="space-y-3">
                      {Object.values(
                        duesDetails.all_dues.reduce((acc, due) => {
                          const key = due.customer_email || 'unknown';
                          if (!acc[key]) {
                            acc[key] = {
                              customer_name: due.customer_name || 'N/A',
                              customer_email: due.customer_email || 'N/A',
                              customer_phone: due.customer_phone || 'N/A',
                              total: 0,
                              pending: 0,
                              overdue: 0
                            };
                          }
                          const amount = Number(due.amount || 0);
                          acc[key].total += amount;
                          if (due.status === 'Pending') acc[key].pending += amount;
                          if (due.status === 'Overdue') acc[key].overdue += amount;
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b.total - a.total)
                        .map((customer) => (
                          <div key={customer.customer_email} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between gap-3">
                              <div>
                                <div className="font-semibold text-gray-900">{customer.customer_name}</div>
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
                        ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No pending or overdue dues for this month</p>
                    </div>
                  )}
                </div>
              )}

              {(!duesDetails || duesDetails.all_dues?.length === 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No pending or overdue dues for this month</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No payment details available for this month</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MonthlyCollectionView;

