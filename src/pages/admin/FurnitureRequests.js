import { useState, useEffect } from 'react';
import { furnitureService } from '../../services/furnitureService';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function FurnitureRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    payment_status: 'Pending',
    scheduled_delivery_date: ''
  });
  const [furnitureDetailsCache, setFurnitureDetailsCache] = useState({});
  const [loadingFurnitureDetails, setLoadingFurnitureDetails] = useState({});

  useEffect(() => {
    fetchFurnitureRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // Debug: Log first request to see structure
      if (requestsData.length > 0) {
        console.log('First request structure:', requestsData[0]);
        console.log('First request furniture_details:', requestsData[0].furniture_details);
      }
      
      setRequests(requestsData);
      
      // Fetch furniture details for requests that have furniture_id but no furniture_details
      fetchMissingFurnitureDetails(requestsData);

      // Try to get valid statuses from response
      let availableStatuses = [];
      
      // First, check if backend explicitly provides validStatuses
      if (response.validStatuses && Array.isArray(response.validStatuses) && response.validStatuses.length) {
        availableStatuses = response.validStatuses;
        console.log('Using validStatuses from backend:', availableStatuses);
      } 
      // Check if it's in response.data
      else if (response.data?.validStatuses && Array.isArray(response.data.validStatuses) && response.data.validStatuses.length) {
        availableStatuses = response.data.validStatuses;
        console.log('Using validStatuses from response.data:', availableStatuses);
      }
      // Fallback: Extract from requests + use new status flow
      else {
        const statusesFromRequests = Array.from(
          new Set(
            requestsData
              .map((req) => req.status)
              .filter(Boolean)
          )
        );
        
        // Use new status flow as base, add any found in requests
        const newStatusFlow = ['Ordered', 'Requested', 'Confirmed', 'Scheduled Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'];
        availableStatuses = Array.from(new Set([...newStatusFlow, ...statusesFromRequests]));
        // Remove old statuses that shouldn't be there
        availableStatuses = availableStatuses.filter(s => !['Accepted', 'Completed'].includes(s));
        console.log('Using new status flow + found in requests:', availableStatuses);
      }

      // Always ensure we have at least the new status flow
      if (availableStatuses.length === 0) {
        availableStatuses = ['Ordered', 'Requested', 'Confirmed', 'Scheduled Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'];
        console.log('Using fallback new status flow:', availableStatuses);
      }

      setStatusOptions(['All', ...availableStatuses]);
      if (activeStatus === 'All' || !availableStatuses.includes(activeStatus)) {
        setActiveStatus('All');
      }
    } catch (error) {
      console.error('Error fetching furniture requests:', error);
      setError('Failed to load furniture requests');
      setRequests([]);
      // On error, still set new status flow
      setStatusOptions(['All', 'Ordered', 'Requested', 'Confirmed', 'Scheduled Delivery', 'Out for Delivery', 'Delivered', 'Cancelled']);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus, additionalData = {}) => {
    try {
      setError(null);
      setSuccess(null);
      console.log('Updating request status:', { requestId, newStatus, additionalData });
      
      await furnitureService.updateFurnitureRequest(requestId, { 
        status: newStatus,
        ...additionalData
      });
      
      // Update local state immediately for better UX
      setRequests(prev =>
        prev.map(request => {
          const reqId = request._id || request.id;
          if (String(reqId) === String(requestId)) {
            return { ...request, status: newStatus };
          }
          return request;
        })
      );

      setSuccess(`Request status updated to ${formatStatusLabel(newStatus)} successfully!`);
      
      // If the updated request is no longer in the current filter, refresh the list
      // This ensures the UI updates correctly when status changes
      if (activeStatus !== newStatus) {
        // Refresh the full list to ensure consistency
        setTimeout(() => {
          fetchFurnitureRequests();
        }, 1000);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      setError(errorMessage);
      if (error.response?.data?.validStatuses) {
        const valid = error.response.data.validStatuses;
        if (Array.isArray(valid) && valid.length) {
          setStatusOptions(valid);
          if (!valid.includes(activeStatus)) {
            setActiveStatus(valid[0]);
          }
        }
      }
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        setError(null);
        await furnitureService.deleteFurnitureRequest(requestId);
        setRequests(prev => prev.filter(r => {
          const reqId = r._id || r.id;
          return String(reqId) !== String(requestId);
        }));
        setError(null);
      } catch (error) {
        console.error('Error deleting request:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete request';
        setError(errorMessage);
      }
    }
  };

  // Fetch furniture details for requests missing furniture_details
  const fetchMissingFurnitureDetails = async (requestsData) => {
    const requestsToFetch = requestsData.filter(req => {
      const hasId = req.furniture_id || req.furniture?._id || req.furniture?.furniture_id;
      const missingDetails = !req.furniture_details && !req.furniture;
      const notCached = hasId && !furnitureDetailsCache[hasId];
      const notLoading = hasId && !loadingFurnitureDetails[hasId];
      return hasId && missingDetails && notCached && notLoading;
    });

    if (requestsToFetch.length === 0) return;

    // Fetch furniture details for each request
    requestsToFetch.forEach(async (request) => {
      const furnitureId = request.furniture_id || request.furniture?._id || request.furniture?.furniture_id;
      if (!furnitureId) return;

      setLoadingFurnitureDetails(prev => ({ ...prev, [furnitureId]: true }));

      try {
        // Try to fetch furniture by ID or furniture_id
        let furnitureData = null;
        
        // First try by _id if it looks like MongoDB ID
        if (furnitureId.length === 24 && /^[0-9a-fA-F]{24}$/.test(furnitureId)) {
          try {
            const response = await furnitureService.getFurnitureById(furnitureId);
            furnitureData = response.furniture || response.data || response;
          } catch (e) {
            console.log('Failed to fetch by _id, trying by furniture_id');
          }
        }
        
        // If not found, try searching by furniture_id field
        if (!furnitureData) {
          try {
            const allFurniture = await furnitureService.getAllFurniture({});
            const furnitureList = allFurniture.furniture || allFurniture.data || allFurniture;
            furnitureData = Array.isArray(furnitureList) 
              ? furnitureList.find(f => f.furniture_id === furnitureId || f._id === furnitureId)
              : null;
          } catch (e) {
            console.error('Error searching furniture:', e);
          }
        }

        if (furnitureData) {
          // Cache the furniture details
          setFurnitureDetailsCache(prev => ({
            ...prev,
            [furnitureId]: furnitureData
          }));

          // Update the request with furniture_details
          setRequests(prev => prev.map(req => {
            const reqId = req.furniture_id || req.furniture?._id || req.furniture?.furniture_id;
            if (reqId === furnitureId) {
              return {
                ...req,
                furniture_details: furnitureData
              };
            }
            return req;
          }));
        }
      } catch (error) {
        console.error(`Error fetching furniture details for ${furnitureId}:`, error);
      } finally {
        setLoadingFurnitureDetails(prev => {
          const updated = { ...prev };
          delete updated[furnitureId];
          return updated;
        });
      }
    });
  };

  const filteredRequests = activeStatus === 'All' 
    ? requests 
    : requests.filter(r => r.status === activeStatus);

  const formatStatusLabel = (status) => {
    if (!status) return '';
    return status
      .toString()
      .replace(/[_-]/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
  };

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
        <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
          {statusOptions.filter(s => s !== 'All' || activeStatus === 'All').map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`pb-2 px-4 whitespace-nowrap ${
                activeStatus === status
                  ? 'border-b-2 border-violet-500 text-violet-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {formatStatusLabel(status)}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {status === 'All' ? requests.length : requests.filter(r => r.status === status).length}
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

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No {activeStatus === 'All' ? '' : activeStatus.toLowerCase()} requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const requestId = request._id || request.id;
            // Debug: Log full request to see what we're getting
            console.log('Full request object:', requestId, request);
            console.log('furniture_id:', request.furniture_id);
            console.log('furniture_details:', request.furniture_details);
            console.log('furniture:', request.furniture);
            
            // Check cache for furniture details
            const furnitureId = request.furniture_id || request.furniture?._id || request.furniture?.furniture_id;
            const cachedDetails = furnitureId ? furnitureDetailsCache[furnitureId] : null;
            const furnitureDetails = request.furniture_details || request.furniture || cachedDetails || {};
            const furnitureName = request.furniture_name || furnitureDetails.name || `Request #${requestId}`;
            const furniturePhotos = furnitureDetails.photos || [];
            const furniturePrice = furnitureDetails.price || {};
            const isLoadingDetails = furnitureId && loadingFurnitureDetails[furnitureId];
            
            // Check if we have any furniture data at all
            const hasFurnitureData = Object.keys(furnitureDetails).length > 0 || request.furniture_id;
            
            return (
            <div
              key={requestId}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Furniture Product Info Section */}
                  {hasFurnitureData && (
                    <div className="flex items-start gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {furniturePhotos.length > 0 ? (
                        <img 
                          src={furniturePhotos[0]} 
                          alt={furnitureName}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {furnitureName}
                        </h3>
                        {request.furniture_id && (
                          <p className="text-xs text-gray-500 mb-2">Furniture ID: {request.furniture_id}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {furnitureDetails.category && (
                            <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                              {furnitureDetails.category}
                            </span>
                          )}
                          {furnitureDetails.item_type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {furnitureDetails.item_type}
                            </span>
                          )}
                          {furnitureDetails.brand && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {furnitureDetails.brand}
                            </span>
                          )}
                          {furnitureDetails.condition && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              {furnitureDetails.condition}
                            </span>
                          )}
                        </div>
                        {(furniturePrice.rent_monthly || furniturePrice.sell_price || furniturePrice.deposit) ? (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {furniturePrice.rent_monthly && (
                              <span className="text-sm font-semibold text-violet-600">
                                Rent: ₹{Number(furniturePrice.rent_monthly).toLocaleString()}/month
                              </span>
                            )}
                            {furniturePrice.sell_price && (
                              <span className="text-sm font-semibold text-violet-600">
                                Buy: ₹{Number(furniturePrice.sell_price).toLocaleString()}
                              </span>
                            )}
                            {furniturePrice.deposit && (
                              <span className="text-sm text-gray-600">
                                Deposit: ₹{Number(furniturePrice.deposit).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : isLoadingDetails ? (
                          <p className="text-xs text-blue-600 mt-2">
                            🔄 Loading furniture details...
                          </p>
                        ) : request.furniture_id && (
                          <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ Furniture details not loaded. Furniture ID: {request.furniture_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!hasFurnitureData && request.furniture_id && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Furniture ID:</strong> {request.furniture_id}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Product details are not available. The backend may need to populate furniture_details.
                      </p>
                    </div>
                  )}
                  
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

                  {/* Payment Status and Scheduled Delivery */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Status</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                        request.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.payment_status || 'Pending'}
                      </span>
                    </div>
                    {request.listing_type === 'Rent' && request.scheduled_delivery_date && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Scheduled Delivery</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(request.scheduled_delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    request.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-800' :
                    request.status === 'Scheduled Delivery' ? 'bg-cyan-100 text-cyan-800' :
                    request.status === 'Ordered' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formatStatusLabel(request.status)}
                  </span>

                  {/* Single Status Update Dropdown */}
                  <select
                    value={request.status || ''}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus && newStatus !== request.status) {
                        handleStatusChange(requestId, newStatus);
                      }
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-200 font-medium min-w-[150px]"
                  >
                    {statusOptions.filter(s => s !== 'All').map((status) => (
                      <option key={`${requestId}-${status}`} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setPaymentFormData({
                          payment_status: request.payment_status || 'Pending',
                          scheduled_delivery_date: request.scheduled_delivery_date || ''
                        });
                        setShowPaymentModal(true);
                      }}
                      className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs hover:bg-violet-200 font-medium"
                    >
                      Payment/Delivery
                    </button>
                    <button
                      onClick={() => handleDelete(requestId)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 font-medium"
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

      {/* Payment/Delivery Update Modal */}
      {showPaymentModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Update Payment & Delivery</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setError(null);
                  const requestId = selectedRequest._id || selectedRequest.id;
                  await furnitureService.updateFurnitureRequest(requestId, {
                    payment_status: paymentFormData.payment_status,
                    ...(selectedRequest.listing_type === 'Rent' && paymentFormData.scheduled_delivery_date && {
                      scheduled_delivery_date: paymentFormData.scheduled_delivery_date
                    })
                  });
                  
                  setSuccess('Payment and delivery information updated successfully!');
                  await fetchFurnitureRequests();
                  setTimeout(() => {
                    setShowPaymentModal(false);
                    setSelectedRequest(null);
                    setSuccess(null);
                  }, 1500);
                } catch (err) {
                  console.error('Error updating payment/delivery:', err);
                  setError(err.response?.data?.message || 'Failed to update payment/delivery');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentFormData.payment_status}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {selectedRequest.listing_type === 'Rent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Delivery Date
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.scheduled_delivery_date}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, scheduled_delivery_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set delivery date for rental items
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {/* Furniture Product Details */}
              {(selectedRequest.furniture_details || selectedRequest.furniture) && (() => {
                const furnitureDetails = selectedRequest.furniture_details || selectedRequest.furniture || {};
                return (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {furnitureDetails.photos && furnitureDetails.photos.length > 0 && (
                      <div className="col-span-2">
                        <img 
                          src={furnitureDetails.photos[0]} 
                          alt={furnitureDetails.name}
                          className="w-full h-48 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Product Name</h4>
                      <p className="text-gray-900 font-medium">{furnitureDetails.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Category</h4>
                      <p className="text-gray-900">{furnitureDetails.category || 'N/A'}</p>
                    </div>
                    {furnitureDetails.item_type && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Item Type</h4>
                        <p className="text-gray-900">{furnitureDetails.item_type}</p>
                      </div>
                    )}
                    {furnitureDetails.brand && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Brand</h4>
                        <p className="text-gray-900">{furnitureDetails.brand}</p>
                      </div>
                    )}
                    {furnitureDetails.condition && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Condition</h4>
                        <p className="text-gray-900">{furnitureDetails.condition}</p>
                      </div>
                    )}
                    {furnitureDetails.listing_type && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Listing Type</h4>
                        <p className="text-gray-900">{furnitureDetails.listing_type}</p>
                      </div>
                    )}
                    {furnitureDetails.price && (
                      <div className="col-span-2 border-t border-violet-200 pt-3 mt-2">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {furnitureDetails.price.rent_monthly && (
                            <div>
                              <p className="text-xs text-gray-600">Monthly Rent</p>
                              <p className="text-sm font-semibold text-violet-600">
                                ₹{Number(furnitureDetails.price.rent_monthly).toLocaleString()}/month
                              </p>
                            </div>
                          )}
                          {furnitureDetails.price.sell_price && (
                            <div>
                              <p className="text-xs text-gray-600">Sell Price</p>
                              <p className="text-sm font-semibold text-violet-600">
                                ₹{Number(furnitureDetails.price.sell_price).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {furnitureDetails.price.deposit && (
                            <div>
                              <p className="text-xs text-gray-600">Deposit</p>
                              <p className="text-sm font-semibold text-violet-600">
                                ₹{Number(furnitureDetails.price.deposit).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {furnitureDetails.features && furnitureDetails.features.length > 0 && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(furnitureDetails.features) 
                            ? furnitureDetails.features.map((feature, idx) => {
                                const featureStr = typeof feature === 'string' 
                                  ? (feature.startsWith('[') ? JSON.parse(feature)[0] : feature)
                                  : JSON.stringify(feature);
                                return (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {featureStr}
                                  </span>
                                );
                              })
                            : <span className="text-sm text-gray-600">{furnitureDetails.features}</span>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Furniture/Item</h4>
                  <p className="text-gray-900">{selectedRequest.furniture_name || selectedRequest.furniture_details?.name || 'N/A'}</p>
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

