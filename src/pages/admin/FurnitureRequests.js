import { useState, useEffect } from 'react';
import { furnitureService } from '../../services/furnitureService';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const STATUS_TYPES = ['Requested', 'Confirmed', 'Delivered', 'Completed'];

function FurnitureRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('Requested');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFurnitureRequests();
  }, []);

  const fetchFurnitureRequests = async () => {
    try {
      setLoading(true);
      const response = await furnitureService.getAllFurnitureRequests();
      console.log('Furniture requests response:', response);
      
      // Handle different response formats
      let requestsData = [];
      if (response.requests) {
        requestsData = response.requests;
      } else if (Array.isArray(response)) {
        requestsData = response;
      } else if (response.data) {
        requestsData = Array.isArray(response.data) ? response.data : [];
      }
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching furniture requests:', error);
      setError('Failed to load furniture requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await furnitureService.updateFurnitureRequest(requestId, { status: newStatus });
      setRequests(prev =>
        prev.map(request =>
          (request.id === requestId || request._id === requestId) ? { ...request, status: newStatus } : request
        )
      );
      setError(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await furnitureService.deleteFurnitureRequest(requestId);
        setRequests(prev => prev.filter(r => r.id !== requestId && r._id !== requestId));
        setError(null);
      } catch (error) {
        console.error('Error deleting request:', error);
        setError('Failed to delete request');
      }
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const filteredRequests = requests.filter(r => r.status === activeStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Furniture & Appliance Requests</h1>
        
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
              {status}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {requests.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No {activeStatus.toLowerCase()} requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const requestId = request._id || request.id;
            return (
            <div
              key={requestId}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {request.furniture_name || request.furniture_details?.name || `Request #${requestId}`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {request.listing_type === 'Sell' ? 'Purchase' : request.listing_type === 'Rent' ? 'Rental' : request.type === 'buy' ? 'Purchase' : 'Rental'} 
                    {request.rental_duration || request.duration ? ` - Duration: ${request.rental_duration || request.duration} months` : ''}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Customer</h4>
                      <p className="text-sm text-gray-600">{request.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Phone</h4>
                      <p className="text-sm text-gray-600">{request.phoneNumber || request.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Email</h4>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Date</h4>
                      <p className="text-sm text-gray-600">
                        {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {request.preferred_time && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Preferred Time: {request.preferred_time}</span>
                    </div>
                  )}

                  {request.address && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Address</h4>
                      <p className="text-sm text-gray-600">{request.address}</p>
                    </div>
                  )}

                  {request.message && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Message</h4>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>

                  <div className="flex gap-2 mt-2">
                    {request.status === 'Requested' && (
                      <button
                        onClick={() => handleStatusChange(requestId, 'Confirmed')}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                      >
                        Confirm
                      </button>
                    )}
                    {request.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusChange(requestId, 'Delivered')}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {request.status === 'Delivered' && (
                      <button
                        onClick={() => handleStatusChange(requestId, 'Completed')}
                        className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-sm hover:bg-violet-200"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(requestId)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Request Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Furniture/Item</h4>
                  <p className="text-gray-900">{selectedRequest.furniture_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Type</h4>
                  <p className="text-gray-900">{selectedRequest.type === 'buy' ? 'Purchase' : 'Rental'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Customer Name</h4>
                  <p className="text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                  <p className="text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Email</h4>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <p className="text-gray-900">{selectedRequest.status}</p>
                </div>
              </div>

              {selectedRequest.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Address</h4>
                  <p className="text-gray-900">{selectedRequest.address}</p>
                </div>
              )}

              {selectedRequest.message && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Message</h4>
                  <p className="text-gray-900">{selectedRequest.message}</p>
                </div>
              )}

              {selectedRequest.preferred_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Preferred Date</h4>
                  <p className="text-gray-900">{new Date(selectedRequest.preferred_date).toLocaleDateString()}</p>
                </div>
              )}

              {selectedRequest.preferred_time && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Preferred Time</h4>
                  <p className="text-gray-900">{selectedRequest.preferred_time}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FurnitureRequests;

