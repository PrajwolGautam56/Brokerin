import { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_TYPES = ['Requested', 'Accepted', 'On Going', 'Completed'];

function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('Requested');

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      // This will be replaced with actual API call
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
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setError('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    // This will be replaced with actual API call
    setRequests(prev =>
      prev.map(request =>
        request.id === requestId ? { ...request, status: newStatus } : request
      )
    );
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
              {status}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {requests.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {request.service_type}
                </h3>
                <p className="text-sm text-gray-500">
                  Requested on {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {request.status === 'Requested' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(request.id, 'Accepted')}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(request.id, 'Rejected')}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                {request.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(request.id, 'On Going')}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                  >
                    Start Service
                  </button>
                )}
                {request.status === 'On Going' && (
                  <button
                    onClick={() => handleStatusChange(request.id, 'Completed')}
                    className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm hover:bg-violet-200"
                  >
                    Mark Complete
                  </button>
                )}
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
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No {activeStatus.toLowerCase()} requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceRequests; 