import { useState, useEffect } from 'react';
import { rentalService } from '../../../services/rentalService';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

function DuesBreakdownView({ totalAmount, byCustomer, allDues, onClose }) {
  const [filteredDues, setFilteredDues] = useState(allDues || []);
  const [filter, setFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());

  useEffect(() => {
    let filtered = allDues || [];
    if (filter === 'pending') {
      filtered = filtered.filter(d => d.status === 'Pending');
    } else if (filter === 'overdue') {
      filtered = filtered.filter(d => d.status === 'Overdue');
    }
    if (selectedCustomer) {
      filtered = filtered.filter(d => d.customer_email === selectedCustomer);
    }
    setFilteredDues(filtered);
  }, [filter, selectedCustomer, allDues]);

  const toggleCustomer = (email) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedCustomers(newExpanded);
  };

  const pendingCount = (allDues || []).filter(d => d.status === 'Pending').length;
  const overdueCount = (allDues || []).filter(d => d.status === 'Overdue').length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Dues Breakdown</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({(allDues || []).length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({overdueCount})
          </button>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <p className="text-sm text-violet-800">
            <strong>Total Dues:</strong> ₹{totalAmount?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Grouped by Customer */}
      {byCustomer && byCustomer.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grouped by Customer</h3>
          <div className="space-y-3">
            {byCustomer.map((customer, idx) => {
              const isExpanded = expandedCustomers.has(customer.customer_email);
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleCustomer(customer.customer_email)}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{customer.customer_name}</h4>
                      <p className="text-sm text-gray-600">{customer.customer_email}</p>
                      {customer.customer_phone && (
                        <p className="text-sm text-gray-600">{customer.customer_phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Rental ID: {customer.rental_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {customer.total_pending > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1">
                          <span className="text-xs text-yellow-800">
                            Pending: ₹{customer.total_pending.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {customer.total_overdue > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded px-3 py-1">
                          <span className="text-xs text-red-800">
                            Overdue: ₹{customer.total_overdue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="bg-violet-50 border border-violet-200 rounded px-3 py-1">
                        <span className="text-xs font-semibold text-violet-800">
                          Total Due: ₹{customer.total_due.toLocaleString()}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {customer.items && customer.items.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Rented Items:</h5>
                          <div className="space-y-1">
                            {customer.items.map((item, i) => (
                              <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {item.product_name} (Qty: {item.quantity}) - ₹{item.monthly_price?.toLocaleString()}/month
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {customer.pending_months && customer.pending_months.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-yellow-700 mb-2">Pending Months:</h5>
                          <div className="space-y-1">
                            {customer.pending_months.map((month, i) => (
                              <div key={i} className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                {month.month} - ₹{month.amount?.toLocaleString()} 
                                {' '}(Due: {new Date(month.dueDate).toLocaleDateString('en-IN')})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {customer.overdue_months && customer.overdue_months.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-700 mb-2">Overdue Months:</h5>
                          <div className="space-y-1">
                            {customer.overdue_months.map((month, i) => (
                              <div key={i} className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-200">
                                {month.month} - ₹{month.amount?.toLocaleString()}
                                {' '}(Due: {new Date(month.dueDate).toLocaleDateString('en-IN')}, 
                                {month.daysOverdue} days overdue)
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Dues List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Dues ({filteredDues.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDues.map((due, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-gray-50 ${
                    due.status === 'Overdue' ? 'bg-red-50' : 
                    due.status === 'Pending' ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{due.customer_name}</div>
                      <div className="text-xs text-gray-500">{due.customer_email}</div>
                      {due.customer_phone && (
                        <div className="text-xs text-gray-500">{due.customer_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{due.month_name || due.month}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{due.amount?.toLocaleString() || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(due.dueDate).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      due.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : due.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {due.status}
                      {due.daysOverdue && ` (${due.daysOverdue} days)`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {due.items && due.items.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {due.items.map((item, i) => (
                            <li key={i}>{item.product_name} {item.quantity > 1 && `(Qty: ${item.quantity})`}</li>
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
      </div>
    </div>
  );
}

export default DuesBreakdownView;

