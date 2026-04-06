import { useState } from 'react';
import { rentalService } from '../../../services/rentalService';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import logger from '../../../utils/logger';

function MonthlyCollectionView({ collection }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthDetails, setMonthDetails] = useState(null);
  const [duesDetails, setDuesDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState('collected');
  const [loading, setLoading] = useState(false);

  const fetchMonthDetails = async (month) => {
    if (selectedMonth === month && monthDetails && duesDetails) {
      setSelectedMonth(null);
      setMonthDetails(null);
      setDuesDetails(null);
      setDetailsTab('collected');
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
      setDetailsTab('collected');
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Collection Records</h2>
      
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
                <span className="text-sm text-gray-600">Total Collected:</span>
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
                    onClick={() => setDetailsTab('collected')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      detailsTab === 'collected'
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Collected
                  </button>
                  <button
                    onClick={() => setDetailsTab('dues')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      detailsTab === 'dues'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Pending / Overdue
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMonth(null);
                      setMonthDetails(null);
                      setDuesDetails(null);
                      setDetailsTab('collected');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {detailsTab === 'collected' && (
                <>
                  {/* Summary Stats for collected */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Collected</div>
                      <div className="text-xl font-bold text-violet-600">
                        ₹{monthDetails.total_collected?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Payments</div>
                      <div className="text-xl font-bold text-blue-600">
                        {monthDetails.payments_count || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Customers</div>
                      <div className="text-xl font-bold text-green-600">
                        {monthDetails.customers_count || monthDetails.payments_count || 0}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Average Payment</div>
                      <div className="text-xl font-bold text-orange-600">
                        ₹{monthDetails.average_payment?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  {/* Payments Table */}
                  {monthDetails.payments && monthDetails.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {monthDetails.payments.map((payment, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                                  <div className="text-xs text-gray-500">{payment.customer_email}</div>
                                  {payment.customer_phone && (
                                    <div className="text-xs text-gray-500">{payment.customer_phone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{payment.rental_id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ₹{payment.amount?.toLocaleString() || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {payment.paymentMethod || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                  {payment.items && payment.items.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                      {payment.items.map((item, i) => (
                                        <li key={i}>{item.product_name} {item.monthly_price && `(₹${item.monthly_price.toLocaleString()}/month)`}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No payment records found for this month</p>
                    </div>
                  )}
                </>
              )}

              {detailsTab === 'dues' && duesDetails && (
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
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {duesDetails.all_dues.map((due, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{due.customer_name}</div>
                                  <div className="text-xs text-gray-500">{due.customer_email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{due.month_name || due.month}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ₹{Number(due.amount || 0).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  {due.dueDate
                                    ? new Date(due.dueDate).toLocaleDateString('en-IN')
                                    : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
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
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No pending or overdue dues for this month</p>
                    </div>
                  )}
                </div>
              )}

              {detailsTab !== 'collected' && (!duesDetails || duesDetails.all_dues?.length === 0) && (
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

