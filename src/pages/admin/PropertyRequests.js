import { useState, useEffect, useMemo } from 'react';
import logger from '../../utils/logger';
import { propertyService } from '../../services/propertyService';
import { TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function PropertyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Requested');
  const [propertyLookup, setPropertyLookup] = useState({});
  const [propertyLookupLoading, setPropertyLookupLoading] = useState(false);
  const [propertyLookupError, setPropertyLookupError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchPropertyLookup();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await propertyService.getAllPropertyRequests();
      // Backend returns { success: true, data: [...], pagination: {...} }
      const requests = response.data || response;
      setRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      logger.error('Error fetching property requests:', error);
      setError('Failed to load property requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyLookup = async () => {
    try {
      setPropertyLookupLoading(true);
      setPropertyLookupError(null);
      const response = await propertyService.getAllProperties();
      const propertyList = response?.properties || response?.data || response || [];

      if (Array.isArray(propertyList)) {
        const lookup = {};
        propertyList.forEach((property) => {
          if (!property) return;
          if (property.property_id) {
            lookup[property.property_id] = property;
          }
          if (property._id) {
            lookup[property._id] = property;
          }
        });
        setPropertyLookup(lookup);
      } else {
        logger.warn('Unexpected properties response structure', response);
        setPropertyLookup({});
      }
    } catch (err) {
      logger.error('Error building property lookup:', err);
      setPropertyLookupError('Failed to load property details');
    } finally {
      setPropertyLookupLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await propertyService.updatePropertyRequest(requestId, { status: newStatus });
      setRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (error) {
      logger.error('Error updating request status:', error);
      alert('Failed to update request status');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await propertyService.deletePropertyRequest(requestId);
        setRequests(prev => prev.filter(request => request._id !== requestId));
      } catch (error) {
        logger.error('Error deleting request:', error);
        alert('Failed to delete request');
      }
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const getPropertyDetails = (request) => {
    if (!request) return null;
    return (
      propertyLookup[request.property_id] ||
      propertyLookup[request.property?._id] ||
      null
    );
  };

  const statusCounts = useMemo(() => {
    const counts = {};
    requests.forEach((request) => {
      counts[request.status] = (counts[request.status] || 0) + 1;
    });
    return counts;
  }, [requests]);

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

  const statusTabs = [
    { id: 'Requested', name: 'Requested', icon: CheckCircleIcon },
    { id: 'Accepted', name: 'Accepted', icon: CheckCircleIcon },
    { id: 'Ongoing', name: 'Ongoing', icon: CheckCircleIcon },
    { id: 'Completed', name: 'Completed', icon: CheckCircleIcon },
    { id: 'Cancelled', name: 'Cancelled', icon: XCircleIcon }
  ];

  const filteredRequests = requests.filter(request => request.status === activeStatus);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Booking Requests</h1>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={`${
                  activeStatus === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
                {statusCounts[tab.id] > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                    {statusCounts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {propertyLookupError && (
          <div className="bg-yellow-50 text-yellow-700 px-6 py-3 text-sm flex items-center justify-between">
            <span>{propertyLookupError}. Showing property IDs only.</span>
            <button
              onClick={fetchPropertyLookup}
              className="text-yellow-800 underline font-medium"
            >
              Retry
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No {activeStatus.toLowerCase()} requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const property = getPropertyDetails(request);
                      return (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {property?.name || 'Unknown property'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {property?.type ? `${property.type}` : 'Property request'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {property?.property_id || request.property_id}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'Requested' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'Ongoing' ? 'bg-purple-100 text-purple-800' :
                      request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleView(request)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {request.status === 'Requested' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request._id, 'Accepted')}
                            className="text-green-600 hover:text-green-900"
                            title="Accept Request"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(request._id, 'Cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Request"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {request.status === 'Accepted' && (
                        <button
                          onClick={() => handleStatusChange(request._id, 'Ongoing')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Mark as Ongoing"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {request.status === 'Ongoing' && (
                        <button
                          onClick={() => handleStatusChange(request._id, 'Completed')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Completed"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Request"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            {propertyLookupLoading && (
              <div className="absolute inset-x-0 -top-6 text-center text-xs text-gray-500">
                Loading property details...
              </div>
            )}
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request Details
              </h3>
              {(() => {
                const property = getPropertyDetails(selectedRequest);
                return (
                  <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Property</h4>
                        <p className="text-base font-semibold text-gray-900">
                          {property?.name || 'Unknown property'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(property?.type || 'Type N/A')} • {property?.furnishing || 'Furnishing N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {property?.property_id || selectedRequest.property_id}
                        </p>
                      </div>
                      {property?._id && (
                        <button
                          onClick={() => window.open(`/property/${property._id}`, '_blank')}
                          className="text-violet-600 text-sm font-medium hover:underline"
                        >
                          View property
                        </button>
                      )}
                    </div>
                    {property?.location?.area && (
                      <p className="text-sm text-gray-500 mt-2">
                        {property.location.area}{property.location.city ? `, ${property.location.city}` : ''}
                      </p>
                    )}
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Property ID</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.property_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Date</h4>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Customer Name</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Email</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedRequest.status === 'Requested' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRequest.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                    selectedRequest.status === 'Ongoing' ? 'bg-purple-100 text-purple-800' :
                    selectedRequest.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Message</h4>
                <p className="text-sm text-gray-900 mt-1">{selectedRequest.message}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                <div className="flex space-x-2">
                  {selectedRequest.status === 'Requested' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedRequest._id, 'Accepted');
                          setIsViewModalOpen(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 flex items-center"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedRequest._id, 'Cancelled');
                          setIsViewModalOpen(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 flex items-center"
                      >
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  {selectedRequest.status === 'Accepted' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedRequest._id, 'Ongoing');
                        setIsViewModalOpen(false);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white text-base font-medium rounded-md hover:bg-purple-700 flex items-center"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Mark as Ongoing
                    </button>
                  )}
                  {selectedRequest.status === 'Ongoing' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedRequest._id, 'Completed');
                        setIsViewModalOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 flex items-center"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Mark as Completed
                    </button>
                  )}
                </div>
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
    </div>
  );
}

export default PropertyRequests; 