import { useState, useEffect } from 'react';
import { rentalService } from '../../services/rentalService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const STATUS_TYPES = ['Active', 'Completed', 'Cancelled', 'On Hold'];

function RentalManagement() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeStatus, setActiveStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
  const [showGeneratePaymentsModal, setShowGeneratePaymentsModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: {
      street: '',
      city: '',
      state: 'Karnataka',
      zipcode: '',
      country: 'India'
    },
    items: [{ 
      product_name: '', 
      product_type: 'Furniture',
      monthly_price: '', 
      deposit: '',
      quantity: 1,
      start_date: '',
      end_date: ''
    }],
    start_date: '',
    end_date: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (activeStatus !== 'All') filters.status = activeStatus;
      if (searchTerm) filters.search = searchTerm;

      const response = await rentalService.getAllRentals(filters);
      // API returns: { success: true, data: [...] } or { data: [...] }
      const rentalsData = response.data || response.rentals || response || [];
      setRentals(Array.isArray(rentalsData) ? rentalsData : []);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError('Failed to load rentals');
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [activeStatus, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customer_address: {
        ...prev.customer_address,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'monthly_price' || field === 'deposit' 
        ? parseFloat(value) || 0 
        : value
    };
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        product_name: '', 
        product_type: 'Furniture',
        monthly_price: '', 
        deposit: '',
        quantity: 1,
        start_date: '',
        end_date: ''
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const totalMonthly = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.monthly_price) || 0) * (parseInt(item.quantity) || 1);
    }, 0);
    const totalDeposit = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.deposit) || 0) * (parseInt(item.quantity) || 1);
    }, 0);
    return { totalMonthly, totalDeposit };
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: {
        street: '',
        city: '',
        state: 'Karnataka',
        zipcode: '',
        country: 'India'
      },
      items: [{ 
        product_name: '', 
        product_type: 'Furniture',
        monthly_price: '', 
        deposit: '',
        quantity: 1,
        start_date: '',
        end_date: ''
      }],
      start_date: '',
      end_date: '',
      status: 'Active',
      notes: ''
    });
    setSelectedRental(null);
  };

  // Generate rental_id in format: RENT-YYYY-MMDD-XXXXXX
  const generateRentalId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RENT-${year}-${month}${day}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Filter out empty items and format according to API
      const items = formData.items
        .filter(item => item.product_name.trim() !== '')
        .map(item => ({
          product_name: item.product_name,
          product_type: item.product_type || 'Furniture',
          quantity: parseInt(item.quantity) || 1,
          monthly_price: parseFloat(item.monthly_price) || 0,
          deposit: parseFloat(item.deposit) || 0,
          start_date: item.start_date || formData.start_date,
          end_date: item.end_date || formData.end_date || null
        }));

      const rentalPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        items: items,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        notes: formData.notes || ''
      };

      // Add rental_id only when creating new rental (backend requires it)
      if (!selectedRental) {
        rentalPayload.rental_id = generateRentalId();
      }

      if (selectedRental) {
        await rentalService.updateRental(selectedRental._id || selectedRental.id, rentalPayload);
        setSuccess('Rental updated successfully!');
      } else {
        await rentalService.createRental(rentalPayload);
        setSuccess('Rental created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchRentals();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving rental:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save rental');
    }
  };

  const handleEdit = (rental) => {
    setSelectedRental(rental);
    setFormData({
      customer_name: rental.customer_name || '',
      customer_email: rental.customer_email || '',
      customer_phone: rental.customer_phone || '',
      customer_address: rental.customer_address || {
        street: '',
        city: '',
        state: 'Karnataka',
        zipcode: '',
        country: 'India'
      },
      items: rental.items && rental.items.length > 0 
        ? rental.items.map(item => ({
            product_name: item.product_name || '',
            product_type: item.product_type || 'Furniture',
            monthly_price: item.monthly_price || '',
            deposit: item.deposit || '',
            quantity: item.quantity || 1,
            start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
            end_date: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : ''
          }))
        : [{ 
            product_name: '', 
            product_type: 'Furniture',
            monthly_price: '', 
            deposit: '',
            quantity: 1,
            start_date: '',
            end_date: ''
          }],
      start_date: rental.start_date ? new Date(rental.start_date).toISOString().split('T')[0] : '',
      end_date: rental.end_date ? new Date(rental.end_date).toISOString().split('T')[0] : '',
      status: rental.status || 'Active',
      notes: rental.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (rentalId) => {
    if (!window.confirm('Are you sure you want to delete this rental?')) return;

    try {
      setError(null);
      await rentalService.deleteRental(rentalId);
      setSuccess('Rental deleted successfully!');
      fetchRentals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting rental:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete rental');
    }
  };

  const handleRecordPayment = async (rentalId, paymentData) => {
    try {
      setError(null);
      await rentalService.addPaymentRecord(rentalId, paymentData);
      setSuccess('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchRentals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to record payment');
    }
  };

  const handleUpdatePayment = async (rentalId, paymentId, paymentData) => {
    try {
      setError(null);
      await rentalService.updatePaymentRecord(rentalId, paymentId, paymentData);
      setSuccess('Payment updated successfully!');
      setShowPaymentUpdateModal(false);
      setSelectedPayment(null);
      fetchRentals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update payment');
    }
  };

  const handleGeneratePayments = async (rentalId, months) => {
    try {
      setError(null);
      await rentalService.generatePaymentRecords(rentalId, months);
      setSuccess(`Generated payment records for ${months} months successfully!`);
      setShowGeneratePaymentsModal(false);
      fetchRentals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error generating payments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate payment records');
    }
  };

  const handleSendReminders = async (rentalId, paymentLink = null) => {
    try {
      setError(null);
      const response = await rentalService.sendReminders(rentalId, paymentLink);
      const data = response.data || response;
      const pendingCount = data.pending_count || 0;
      const overdueCount = data.overdue_count || 0;
      setSuccess(`Payment reminder email sent successfully! (${pendingCount} pending, ${overdueCount} overdue)`);
      fetchRentals();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error sending reminders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send reminders');
    }
  };

  const filteredRentals = activeStatus === 'All' 
    ? rentals 
    : rentals.filter(r => r.status === activeStatus);

  if (loading && rentals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rental Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Rental
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Status Tabs */}
          <div className="flex space-x-2 border-b border-gray-200 flex-1">
            {['All', ...STATUS_TYPES].map((status) => (
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
                  {status === 'All' 
                    ? rentals.length 
                    : rentals.filter(r => r.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rentals List */}
      <div className="space-y-4">
        {filteredRentals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No rentals found</p>
          </div>
        ) : (
          filteredRentals.map((rental) => {
            const rentalId = rental._id || rental.id;
            return (
              <div
                key={rentalId}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {rental.rental_id || `Rental #${(rental._id || rental.id).slice(-6)}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rental.status === 'Active' ? 'bg-green-100 text-green-800' :
                        rental.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        rental.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rental.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Customer:</h4>
                      <p className="text-sm text-gray-900 font-medium">{rental.customer_name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{rental.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{rental.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ₹{rental.total_monthly_amount || 0}/month
                        </span>
                      </div>
                    </div>

                    {rental.customer_address && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Address:</strong> {
                            rental.customer_address.street ? 
                              `${rental.customer_address.street}, ${rental.customer_address.city}, ${rental.customer_address.state} ${rental.customer_address.zipcode}, ${rental.customer_address.country}` :
                              (typeof rental.customer_address === 'string' ? rental.customer_address : 'N/A')
                          }
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    {rental.items && rental.items.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="space-y-1">
                          {rental.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {item.product_name} ({item.product_type || 'Furniture'}) - ₹{item.monthly_price}/month
                              {item.quantity > 1 && ` x ${item.quantity}`}
                              {item.deposit > 0 && ` | Deposit: ₹${item.deposit}`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 text-sm">
                      <div>
                        <strong>Total Deposit:</strong> ₹{rental.total_deposit || 0}
                      </div>
                      <div>
                        <strong>Total Monthly:</strong> ₹{rental.total_monthly_amount || 0}
                      </div>
                    </div>

                    {/* Payment Records */}
                    {rental.payment_records && rental.payment_records.length > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Payment Records:</h4>
                          {(() => {
                            const pendingPayments = rental.payment_records.filter(
                              p => p.status === 'Pending' || p.status === 'Overdue'
                            );
                            return pendingPayments.length > 0 ? (
                              <button
                                onClick={() => handleSendReminders(rentalId)}
                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs hover:bg-orange-200 font-medium"
                                title="Send payment reminders to customer"
                              >
                                Send Reminders ({pendingPayments.length})
                              </button>
                            ) : null;
                          })()}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Month</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {rental.payment_records.map((payment) => {
                                const [year, month] = payment.month.split('-');
                                const isOverdue = payment.status === 'Overdue' || 
                                  (payment.status === 'Pending' && payment.dueDate && new Date(payment.dueDate) < new Date());
                                return (
                                  <tr 
                                    key={payment._id} 
                                    className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}
                                  >
                                    <td className="px-3 py-2">
                                      {new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-3 py-2">₹{payment.amount}</td>
                                    <td className="px-3 py-2">
                                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                        payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                        payment.status === 'Partial' ? 'bg-orange-100 text-orange-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {payment.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      {payment.status !== 'Paid' && (
                                        <button
                                          onClick={() => {
                                            setSelectedRental(rental);
                                            setSelectedPayment(payment);
                                            setShowPaymentUpdateModal(true);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        >
                                          Update
                                        </button>
                                      )}
                                      {payment.status === 'Paid' && payment.paidDate && (
                                        <span className="text-xs text-gray-500">
                                          Paid: {new Date(payment.paidDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedRental(rental);
                          setShowPaymentModal(true);
                        }}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                        title="Record Payment"
                      >
                        <CurrencyDollarIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRental(rental);
                          setShowGeneratePaymentsModal(true);
                        }}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                        title="Generate Payment Records"
                      >
                        Generate
                      </button>
                      <button
                        onClick={() => handleEdit(rental)}
                        className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-sm hover:bg-violet-200"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rentalId)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedRental ? 'Edit Rental' : 'Add New Rental'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {STATUS_TYPES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address.zipcode}
                    onChange={(e) => handleAddressChange('zipcode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Items (Products/Services) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-violet-600 hover:text-violet-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Product name"
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.product_type}
                          onChange={(e) => handleItemChange(index, 'product_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                          <option value="Furniture">Furniture</option>
                          <option value="Appliance">Appliance</option>
                          <option value="Electronic">Electronic</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Monthly Price"
                          value={item.monthly_price}
                          onChange={(e) => handleItemChange(index, 'monthly_price', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Deposit"
                          value={item.deposit}
                          onChange={(e) => handleItemChange(index, 'deposit', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right space-x-4">
                  <strong>Total Monthly: ₹{calculateTotals().totalMonthly}</strong>
                  <strong>Total Deposit: ₹{calculateTotals().totalDeposit}</strong>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  {selectedRental ? 'Update' : 'Create'} Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRental && (
        <PaymentModal
          rental={selectedRental}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedRental(null);
          }}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {/* Payment Update Modal */}
      {showPaymentUpdateModal && selectedRental && selectedPayment && (
        <PaymentUpdateModal
          rental={selectedRental}
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentUpdateModal(false);
            setSelectedRental(null);
            setSelectedPayment(null);
          }}
          onUpdatePayment={handleUpdatePayment}
        />
      )}

      {/* Generate Payments Modal */}
      {showGeneratePaymentsModal && selectedRental && (
        <GeneratePaymentsModal
          rental={selectedRental}
          onClose={() => {
            setShowGeneratePaymentsModal(false);
            setSelectedRental(null);
          }}
          onGenerate={handleGeneratePayments}
        />
      )}
    </div>
  );
}

// Payment Modal Component
function PaymentModal({ rental, onClose, onRecordPayment }) {
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  const defaultMonth = `${currentYear}-${currentMonth}`;

  const [paymentData, setPaymentData] = useState({
    month: defaultMonth, // Format: YYYY-MM
    amount: rental.total_monthly_amount || '',
    dueDate: new Date(currentYear, currentDate.getMonth(), 8).toISOString().split('T')[0], // 8th of month
    paidDate: new Date().toISOString().split('T')[0],
    status: 'Paid',
    paymentMethod: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      month: paymentData.month,
      amount: parseFloat(paymentData.amount),
      dueDate: paymentData.dueDate,
      paidDate: paymentData.paidDate || undefined,
      status: paymentData.status,
      paymentMethod: paymentData.paymentMethod || undefined,
      notes: paymentData.notes || undefined
    };
    onRecordPayment(rental._id || rental.id, payload);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month (YYYY-MM) <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={paymentData.month}
              onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.status}
              onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentData.dueDate}
                onChange={(e) => setPaymentData({ ...paymentData, dueDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Date
              </label>
              <input
                type="date"
                value={paymentData.paidDate}
                onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <input
              type="text"
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              placeholder="e.g., Bank Transfer, Cash, UPI"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Update Modal Component
function PaymentUpdateModal({ rental, payment, onClose, onUpdatePayment }) {
  const [paymentData, setPaymentData] = useState({
    status: payment.status || 'Paid',
    paidDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: payment.paymentMethod || '',
    notes: payment.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdatePayment(rental._id || rental.id, payment._id, paymentData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Update Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Month:</strong> {payment.month}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount:</strong> ₹{payment.amount}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.status}
              onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Date
            </label>
            <input
              type="date"
              value={paymentData.paidDate}
              onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <input
              type="text"
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              placeholder="e.g., Bank Transfer, Cash, UPI"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Update Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Generate Payments Modal Component
function GeneratePaymentsModal({ rental, onClose, onGenerate }) {
  const [months, setMonths] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(rental._id || rental.id, parseInt(months));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Generate Payment Records</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>ℹ️ Note:</strong> Payment records are automatically generated daily for:
          </p>
          <ul className="text-xs text-blue-700 list-disc list-inside space-y-1 mb-2">
            <li>Past due months</li>
            <li>Current month</li>
            <li>Next month (1 month ahead)</li>
          </ul>
          <p className="text-xs text-blue-700">
            Use this only if you need to manually generate additional records.
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Rental:</strong> {rental.rental_id || rental._id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Monthly Amount:</strong> ₹{rental.total_monthly_amount?.toLocaleString() || 0}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Months <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              required
              min="1"
              max="12"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Manually generate payment records for the next {months} months (if needed)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Generate Records
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RentalManagement;

