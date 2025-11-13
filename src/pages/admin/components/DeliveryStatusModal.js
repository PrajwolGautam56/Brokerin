import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function DeliveryStatusModal({ transaction, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    delivery_status: transaction.delivery_status || 'Pending',
    delivery_tracking_number: transaction.delivery_tracking_number || '',
    delivery_date: transaction.delivery_date ? new Date(transaction.delivery_date).toISOString().split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const statusData = {
        delivery_status: formData.delivery_status,
        ...(formData.delivery_tracking_number && {
          delivery_tracking_number: formData.delivery_tracking_number
        }),
        ...(formData.delivery_date && {
          delivery_date: new Date(formData.delivery_date).toISOString()
        })
      };
      await onSuccess(statusData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Update Delivery Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID
            </label>
            <input
              type="text"
              value={transaction.transaction_id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Status *
            </label>
            <select
              value={formData.delivery_status}
              onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {formData.delivery_status === 'Out for Delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number *
              </label>
              <input
                type="text"
                value={formData.delivery_tracking_number}
                onChange={(e) => setFormData({ ...formData, delivery_tracking_number: e.target.value })}
                required
                placeholder="Enter tracking number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date
            </label>
            <input
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeliveryStatusModal;

