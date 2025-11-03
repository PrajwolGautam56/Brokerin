import { useState, useEffect } from 'react';
import serviceBookingService from '../../services/serviceBookingService';
import { CheckCircleIcon, XCircleIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const STATUS_TYPES = ['requested', 'accepted', 'ongoing', 'completed', 'cancelled'];
const STATUS_LABELS = {
  'requested': 'Requested',
  'accepted': 'Accepted',
  'ongoing': 'On Going',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('requested');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [timeUpdateData, setTimeUpdateData] = useState({
    preferred_date: '',
    preferred_time: '',
    alternate_date: '',
    alternate_time: ''
  });

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const response = await serviceBookingService.getAllBookings();
      setRequests(response.bookings || response || []);
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError('Failed to load service requests');
      // Fallback to mock data if API fails
      const mockRequests = [
        {
          id: 1,
          service_type: 'Plumbing',
          name: 'John Doe',
          phone_number: '+91 9876543210',
          preferred_date: '2024-03-20',
          preferred_time: '10:00',
          service_address: '123 Main St, Bangalore',
          status: 'Requested',
          created_at: '2024-03-18T10:30:00Z'
        },
        {
          id: 2,
          service_type: 'Electrical',
          name: 'Jane Smith',
          phone_number: '+91 9876543211',
          preferred_date: '2024-03-21',
          preferred_time: '14:00',
          service_address: '456 Park Ave, Bangalore',
          status: 'Accepted',
          created_at: '2024-03-18T11:30:00Z'
        },
        {
          id: 3,
          service_type: 'Cleaning',
          name: 'Mike Johnson',
          phone_number: '+91 9876543212',
          preferred_date: '2024-03-19',
          preferred_time: '09:00',
          service_address: '789 Lake View, Bangalore',
          status: 'Completed',
          created_at: '2024-03-17T15:30:00Z'
        }
      ];
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await serviceBookingService.updateBookingStatus(requestId, newStatus);
      setRequests(prev =>
        prev.map(request =>
          (request._id || request.id) === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await serviceBookingService.deleteBooking(requestId);
        setRequests(prev => prev.filter(request => (request._id || request.id) !== requestId));
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleEditTime = (request) => {
    setSelectedRequest(request);
    setTimeUpdateData({
      preferred_date: request.preferred_date || '',
      preferred_time: request.preferred_time || '',
      alternate_date: request.alternate_date || '',
      alternate_time: request.alternate_time || ''
    });
    setIsEditTimeModalOpen(true);
  };

  const handleUpdateTime = async () => {
    try {
      const bookingId = selectedRequest._id || selectedRequest.id;
      await serviceBookingService.updateBookingTime(bookingId, timeUpdateData);
      
      // Update local state
      setRequests(prev =>
        prev.map(request =>
          (request._id || request.id) === bookingId
            ? { ...request, ...timeUpdateData }
            : request
        )
      );
      
      alert('Booking time updated! Customer has been notified via email.');
      setIsEditTimeModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating booking time:', error);
      alert('Failed to update booking time');
    }
  };

  const handleTimeInputChange = (e) => {
    const { name, value } = e.target;
    setTimeUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredRequests = requests.filter(request => request.status === activeStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Requests</h1>
        
        {/* Status Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          {STATUS_TYPES.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`pb-2 px-4 ${
                activeStatus === status
                  ? 'border-b-2 border-violet-500 text-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {STATUS_LABELS[status]}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {requests.filter(r => r.status?.toLowerCase() === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No {STATUS_LABELS[activeStatus].toLowerCase()} requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request._id || request.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {request.service_type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(request.createdAt || request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(request)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditTime(request)}
                    className="text-purple-600 hover:text-purple-900"
                    title="Edit Time/Date"
                  >
                    📅
                  </button>
                  {(request.status?.toLowerCase() === 'requested') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(request._id || request.id, 'accepted')}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(request._id || request.id, 'cancelled')}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {request.status?.toLowerCase() === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(request._id || request.id, 'ongoing')}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                    >
                      Start Service
                    </button>
                  )}
                  {request.status?.toLowerCase() === 'ongoing' && (
                    <button
                      onClick={() => handleStatusChange(request._id || request.id, 'completed')}
                      className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm hover:bg-violet-200"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request._id || request.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Customer Details</h4>
                <p className="text-sm text-gray-600">{request.name}</p>
                <p className="text-sm text-gray-600">{request.phone_number}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Service Details</h4>
                <p className="text-sm text-gray-600">
                  Date: {new Date(request.preferred_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Time: {request.preferred_time}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Service Address</h4>
              <p className="text-sm text-gray-600">{request.service_address}</p>
            </div>
          </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Service Booking Details
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Service Type</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.service_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedRequest.status?.toLowerCase() === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRequest.status?.toLowerCase() === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    selectedRequest.status?.toLowerCase() === 'ongoing' ? 'bg-purple-100 text-purple-800' :
                    selectedRequest.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Customer Name</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.phone_number}</p>
                </div>
                {selectedRequest.email && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email</h4>
                    <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Preferred Date</h4>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Preferred Time</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.preferred_time || 'N/A'}</p>
                </div>
                {selectedRequest.alternate_date && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Alternate Date</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedRequest.alternate_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRequest.alternate_time && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Alternate Time</h4>
                    <p className="text-sm text-gray-900">{selectedRequest.alternate_time}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Service Address</h4>
                <p className="text-sm text-gray-900 mt-1">{selectedRequest.service_address}</p>
              </div>
              {selectedRequest.additional_notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Additional Notes</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedRequest.additional_notes}</p>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Time Modal */}
      {isEditTimeModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Booking Time/Date
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Details</h4>
                  <p className="text-sm text-gray-600">Date: {new Date(selectedRequest.preferred_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Time: {selectedRequest.preferred_time}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={timeUpdateData.preferred_date}
                      onChange={handleTimeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Preferred Time
                    </label>
                    <select
                      name="preferred_time"
                      value={timeUpdateData.preferred_time}
                      onChange={handleTimeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Select time</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="alternate_date"
                      value={timeUpdateData.alternate_date}
                      onChange={handleTimeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Time (Optional)
                    </label>
                    <select
                      name="alternate_time"
                      value={timeUpdateData.alternate_time}
                      onChange={handleTimeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Select time</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setIsEditTimeModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTime}
                    className="px-4 py-2 bg-violet-600 text-white text-base font-medium rounded-md hover:bg-violet-700"
                  >
                    Update Time
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceRequests; 