import { useState, useEffect } from 'react';
import { contactService } from '../../services/contactService';
import { TrashIcon, EyeIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

function ContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryFilters = {};
      if (filters.search && filters.search.trim()) {
        queryFilters.search = filters.search.trim();
      }
      if (activeStatus !== 'all') {
        queryFilters.status = activeStatus;
      }
      queryFilters.page = filters.page || 1;
      queryFilters.limit = filters.limit || 50;

      const response = await contactService.getAllContactInquiries(queryFilters);
      const inquiriesData = response.inquiries || response.data || response;
      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
    } catch (err) {
      console.error('Error fetching contact inquiries:', err);
      setError(err.message || 'Failed to load contact inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await contactService.updateContactInquiry(inquiryId, { status: newStatus });
      setInquiries(prev =>
        prev.map(inquiry =>
          (inquiry._id === inquiryId || inquiry.id === inquiryId)
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
      if (selectedInquiry && (selectedInquiry._id === inquiryId || selectedInquiry.id === inquiryId)) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update inquiry status');
    }
  };

  const handleDelete = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this contact inquiry?')) {
      try {
        await contactService.deleteContactInquiry(inquiryId);
        setInquiries(prev => prev.filter(inquiry => inquiry._id !== inquiryId && inquiry.id !== inquiryId));
        if (selectedInquiry && (selectedInquiry._id === inquiryId || selectedInquiry.id === inquiryId)) {
          setIsViewModalOpen(false);
        }
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        alert('Failed to delete inquiry');
      }
    }
  };

  const handleView = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'new') {
      return 'bg-blue-100 text-blue-800';
    } else if (statusLower === 'read') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'responded') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const statusTabs = [
    { id: 'all', name: 'All', count: inquiries.length },
    { id: 'new', name: 'New', count: inquiries.filter(i => i.status === 'new').length },
    { id: 'read', name: 'Read', count: inquiries.filter(i => i.status === 'read').length },
    { id: 'responded', name: 'Responded', count: inquiries.filter(i => i.status === 'responded').length }
  ];

  const filteredInquiries = activeStatus === 'all' 
    ? inquiries 
    : inquiries.filter(inquiry => inquiry.status === activeStatus);

  // Also filter by search if provided
  const searchFilteredInquiries = filters.search
    ? filteredInquiries.filter(inquiry =>
        inquiry.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.fullname?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.contact_id?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : filteredInquiries;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all customer contact inquiries</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, message, name, email, or contact ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatus(tab.id);
                setFilters({ ...filters, status: tab.id === 'all' ? '' : tab.id });
              }}
              className={`${
                activeStatus === tab.id
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  activeStatus === tab.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
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
              {searchFilteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {filters.search
                      ? 'No inquiries found matching your search'
                      : `No ${activeStatus === 'all' ? '' : activeStatus} inquiries found`}
                  </td>
                </tr>
              ) : (
                searchFilteredInquiries.map((inquiry) => {
                  const inquiryId = inquiry._id || inquiry.id;
                  return (
                    <tr key={inquiryId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.contact_id || inquiryId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.fullname || inquiry.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.email || 'N/A'}
                        </div>
                        {inquiry.phonenumber && (
                          <div className="text-xs text-gray-400 mt-1">
                            {inquiry.phonenumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={inquiry.subject}>
                          {inquiry.subject || 'No Subject'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md">
                          <p className="truncate" title={inquiry.message}>
                            {inquiry.message || 'No message'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {inquiry.created_at ? new Date(inquiry.created_at).toLocaleTimeString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={inquiry.status || 'new'}
                          onChange={(e) => handleStatusChange(inquiryId, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(inquiry.status)} focus:ring-2 focus:ring-violet-500 cursor-pointer`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleView(inquiry)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inquiryId)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Inquiry"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Contact Inquiry Details
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Contact ID</h4>
                  <p className="text-sm text-gray-900">{selectedInquiry.contact_id || selectedInquiry._id || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Date</h4>
                  <p className="text-sm text-gray-900">
                    {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Full Name</h4>
                  <p className="text-sm text-gray-900">{selectedInquiry.fullname || selectedInquiry.fullName || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Email</h4>
                  <p className="text-sm text-gray-900">{selectedInquiry.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Phone Number</h4>
                  <p className="text-sm text-gray-900">{selectedInquiry.phonenumber || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <select
                    value={selectedInquiry.status || 'new'}
                    onChange={(e) => handleStatusChange(selectedInquiry._id || selectedInquiry.id, e.target.value)}
                    className={`mt-1 text-xs font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(selectedInquiry.status)} focus:ring-2 focus:ring-violet-500 cursor-pointer`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                  </select>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Subject</h4>
                <p className="text-sm text-gray-900 mt-1">{selectedInquiry.subject || 'No Subject'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Message</h4>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedInquiry.message || 'No message'}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    if (selectedInquiry.status !== 'read' && selectedInquiry.status !== 'responded') {
                      handleStatusChange(selectedInquiry._id || selectedInquiry.id, 'read');
                    }
                  }}
                  disabled={selectedInquiry.status === 'read' || selectedInquiry.status === 'responded'}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedInquiry._id || selectedInquiry.id, 'responded');
                  }}
                  disabled={selectedInquiry.status === 'responded'}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Mark as Responded
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
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

export default ContactInquiries;

