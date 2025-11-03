import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import serviceBookingService from '../services/serviceBookingService';
import { PencilIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function MyServiceBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    preferred_date: '',
    preferred_time: '',
    alternate_date: '',
    alternate_time: '',
    service_address: '',
    additional_notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceBookingService.getMyBookings();
      // Handle different response formats
      let bookingsData = [];
      if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.bookings && Array.isArray(response.bookings)) {
        bookingsData = response.bookings;
      }
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'requested' || statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'accepted' || statusLower === 'confirmed') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'ongoing') {
      return 'bg-blue-100 text-blue-800';
    } else if (statusLower === 'completed') {
      return 'bg-teal-100 text-teal-800';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const canEdit = (booking) => {
    const status = booking.status?.toLowerCase();
    return status !== 'completed' && status !== 'cancelled';
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditData({
      preferred_date: booking.preferred_date ? new Date(booking.preferred_date).toISOString().split('T')[0] : '',
      preferred_time: booking.preferred_time || '',
      alternate_date: booking.alternate_date ? new Date(booking.alternate_date).toISOString().split('T')[0] : '',
      alternate_time: booking.alternate_time || '',
      service_address: booking.service_address || '',
      additional_notes: booking.additional_notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const bookingId = selectedBooking._id || selectedBooking.id;
      await serviceBookingService.updateMyBooking(bookingId, editData);
      await fetchMyBookings(); // Refresh list
      setIsEditModalOpen(false);
      setSelectedBooking(null);
      alert('Booking updated successfully!');
    } catch (err) {
      console.error('Error updating booking:', err);
      alert(err.message || 'Failed to update booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await serviceBookingService.cancelMyBooking(bookingId);
      await fetchMyBookings(); // Refresh list
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Service Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your service bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No service bookings found. Book a service to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const bookingId = booking._id || booking.id;
                    const bookingDate = booking.created_at || booking.createdAt;
                    return (
                      <tr key={bookingId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.service_booking_id || `#${bookingId.slice(-6)}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bookingDate ? new Date(bookingDate).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {booking.service_type?.replace('_', ' ') || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.preferred_time || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={booking.service_address}>
                            {booking.service_address || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleView(booking)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {canEdit(booking) && (
                              <>
                                <button
                                  onClick={() => handleEdit(booking)}
                                  className="text-violet-600 hover:text-violet-900"
                                  title="Edit Booking"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleCancel(bookingId)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel Booking"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.service_booking_id || `#${(selectedBooking._id || selectedBooking.id).slice(-6)}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedBooking.service_type?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date & Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.preferred_date ? new Date(selectedBooking.preferred_date).toLocaleDateString() : '-'} 
                    {selectedBooking.preferred_time && ` at ${selectedBooking.preferred_time}`}
                  </p>
                </div>
                {selectedBooking.alternate_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alternate Date & Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedBooking.alternate_date).toLocaleDateString()}
                      {selectedBooking.alternate_time && ` at ${selectedBooking.alternate_time}`}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.service_address || '-'}</p>
                </div>
                {selectedBooking.additional_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.additional_notes}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.created_at || selectedBooking.createdAt 
                      ? new Date(selectedBooking.created_at || selectedBooking.createdAt).toLocaleString() 
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Booking</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={editData.preferred_date}
                      onChange={(e) => setEditData({ ...editData, preferred_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="preferred_time"
                      value={editData.preferred_time}
                      onChange={(e) => setEditData({ ...editData, preferred_time: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Date
                    </label>
                    <input
                      type="date"
                      name="alternate_date"
                      value={editData.alternate_date}
                      onChange={(e) => setEditData({ ...editData, alternate_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Time
                    </label>
                    <input
                      type="time"
                      name="alternate_time"
                      value={editData.alternate_time}
                      onChange={(e) => setEditData({ ...editData, alternate_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Address *
                  </label>
                  <textarea
                    name="service_address"
                    value={editData.service_address}
                    onChange={(e) => setEditData({ ...editData, service_address: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="additional_notes"
                    value={editData.additional_notes}
                    onChange={(e) => setEditData({ ...editData, additional_notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                  >
                    Update Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyServiceBookingsPage() {
  return (
    <ProtectedRoute>
      <MyServiceBookings />
    </ProtectedRoute>
  );
}

