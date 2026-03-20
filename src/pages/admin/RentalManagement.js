import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { rentalService } from '../../services/rentalService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon
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
  const [paymentLoading, setPaymentLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRentals, setTotalRentals] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rentalsPerPage] = useState(20);
  const [allRentalsCount, setAllRentalsCount] = useState({}); // For tab counts
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRentals = async (page = 1, fetchCounts = false) => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        page: page,
        limit: rentalsPerPage,
        exclude_order_source: 'cart'
      };
      if (activeStatus !== 'All') filters.status = activeStatus;
      if (searchTerm) filters.search = searchTerm;

      const response = await rentalService.getAllRentals(filters);
      
      // Handle paginated response
      if (response.pagination) {
        const rentalsData = response.data || response.rentals || [];
        setRentals(Array.isArray(rentalsData) ? rentalsData : []);
        setTotalRentals(response.pagination.total || rentalsData.length);
        setTotalPages(response.pagination.totalPages || Math.ceil((response.pagination.total || rentalsData.length) / rentalsPerPage));
        setCurrentPage(response.pagination.currentPage || page);
      } else {
        // Handle non-paginated response
        const rentalsData = response.data || response.rentals || response || [];
        setRentals(Array.isArray(rentalsData) ? rentalsData : []);
        setTotalRentals(rentalsData.length);
        setTotalPages(1);
        setCurrentPage(1);
      }

      // Fetch counts for tabs if needed
      if (fetchCounts || page === 1) {
        fetchRentalCounts();
      }
    } catch (err) {
      logger.error('Error fetching rentals:', err);
      setError('Failed to load rentals');
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts for all statuses for tab display
  const fetchRentalCounts = async () => {
    try {
      const counts = { All: 0 };
      const statusTypes = ['Active', 'Completed', 'Cancelled', 'On Hold'];
      
      // Fetch all rentals without pagination to get accurate counts
      const allFilters = { limit: 1000, exclude_order_source: 'cart' }; // Large limit to get all offline rentals
      const allResponse = await rentalService.getAllRentals(allFilters);
      const allRentalsRaw = allResponse.data || allResponse.rentals || allResponse || [];
      const allRentals = allRentalsRaw;
      
      counts.All = allRentals.length;
      statusTypes.forEach(status => {
        counts[status] = allRentals.filter(r => r.status === status).length;
      });
      
      setAllRentalsCount(counts);
    } catch (err) {
      logger.error('Error fetching rental counts:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchRentals(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, searchTerm]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchRentals(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      fetchRentals(1); // Go to first page after creating/updating

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Error saving rental:', err);
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
      fetchRentals(currentPage);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Error deleting rental:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete rental');
    }
  };

  const handleRecordPayment = async (rentalId, paymentData) => {
    try {
      setError(null);
      await rentalService.addPaymentRecord(rentalId, paymentData);
      setSuccess('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchRentals(currentPage);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Error recording payment:', err);
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
      fetchRentals(currentPage);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Error updating payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update payment');
    }
  };

  const handleGeneratePayments = async (rentalId, months) => {
    try {
      setError(null);
      await rentalService.generatePaymentRecords(rentalId, months);
      setSuccess(`Generated payment records for ${months} months successfully!`);
      setShowGeneratePaymentsModal(false);
      fetchRentals(currentPage);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logger.error('Error generating payments:', err);
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
      fetchRentals(currentPage);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      logger.error('Error sending reminders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send reminders');
    }
  };

  // Delete payment record
  const handleDeletePayment = async (rentalId, paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }

    setPaymentLoading({ ...paymentLoading, [paymentId]: true });
    setError(null);

    try {
      const response = await rentalService.deletePaymentRecord(rentalId, paymentId);
      if (response.success || response.data) {
        setSuccess('Payment record deleted successfully!');
        fetchRentals(currentPage);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      logger.error('Error deleting payment record:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete payment record';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setPaymentLoading({ ...paymentLoading, [paymentId]: false });
    }
  };

  // Send reminder for specific month
  const handleSendReminderForMonth = async (rentalId, paymentId) => {
    if (!window.confirm('Send payment reminder email to customer?')) {
      return;
    }

    const loadingKey = `reminder-${paymentId}`;
    setPaymentLoading({ ...paymentLoading, [loadingKey]: true });
    setError(null);

    try {
      const response = await rentalService.sendReminderForMonth(rentalId, paymentId);
      if (response.success || response.data) {
        const data = response.data || response;
        const reminderType = data.reminderType;
        const daysUntilDue = data.daysUntilDue || 0;
        
        let message = 'Reminder sent successfully!';
        if (reminderType === 'overdue') {
          message = `Overdue reminder sent! Payment is ${Math.abs(daysUntilDue)} days overdue.`;
        } else if (reminderType === 'pending') {
          message = `Reminder sent! Payment is due in ${daysUntilDue} days.`;
        }
        
        setSuccess(message);
        fetchRentals(currentPage);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      logger.error('Error sending reminder for month:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to send reminder';
      
      // Handle specific error cases
      if (err.response?.status === 400 && errorMessage.toLowerCase().includes('paid')) {
        errorMessage = 'Cannot send reminder for a payment that is already marked as paid.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setPaymentLoading({ ...paymentLoading, [loadingKey]: false });
    }
  };

  // Exclude cart-created rentals from Rental Management view (keep all others, including old ones)
  const filteredRentals = rentals.filter(r => r.order_source !== 'cart');

  if (loading && rentals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: allRentalsCount.All || totalRentals,
    active: allRentalsCount.Active || 0,
    completed: allRentalsCount.Completed || 0,
    cancelled: allRentalsCount.Cancelled || 0,
    onHold: allRentalsCount['On Hold'] || 0
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50/80 to-pink-50/60"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Animated Dots Pattern */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_2px_2px,_rgb(139,92,246)_1px,_transparent_0)] bg-[length:60px_60px] animate-[move_20s_linear_infinite]"></div>
      </div>

      {/* Modern Header with Enhanced Gradient */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,_white_1px,_transparent_0)] bg-[length:40px_40px] animate-[move_15s_linear_infinite]"></div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
                Rental Management
              </h1>
              <p className="text-violet-100 text-lg">Manage offline rentals and monthly payments</p>
            </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
              className="group relative flex items-center gap-3 bg-white text-violet-600 px-6 py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 overflow-hidden"
        >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PlusIcon className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Add New Rental</span>
        </button>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-white/80 text-sm font-medium mb-1">Total Rentals</div>
              <div className="text-3xl font-extrabold text-white">{stats.total}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-white/80 text-sm font-medium mb-1">Active</div>
              <div className="text-3xl font-extrabold text-white">{stats.active}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-white/80 text-sm font-medium mb-1">Completed</div>
              <div className="text-3xl font-extrabold text-white">{stats.completed}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-white/80 text-sm font-medium mb-1">Cancelled</div>
              <div className="text-3xl font-extrabold text-white">{stats.cancelled}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-white/80 text-sm font-medium mb-1">On Hold</div>
              <div className="text-3xl font-extrabold text-white">{stats.onHold}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 z-10">
      {/* Messages */}
      {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-down backdrop-blur-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <XMarkIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 font-semibold">{error}</div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 hover:scale-110 transform transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
      )}
      {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 via-emerald-100 to-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-down backdrop-blur-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 font-semibold">{success}</div>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 hover:scale-110 transform transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
      )}

        {/* Modern Filters Section with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/50 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-purple-50/50 pointer-events-none"></div>
          <div className="relative z-10">
          {/* Status Tabs - Modern Design */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['All', ...STATUS_TYPES].map((status) => {
              const count = allRentalsCount[status] !== undefined ? allRentalsCount[status] : (status === 'All' ? totalRentals : 0);
              const isActive = activeStatus === status;
              return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                  <span className="relative z-10 flex items-center gap-2">
                {status}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-violet-100 text-violet-700'
                    }`}>
                      {count}
                </span>
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
              </button>
              );
            })}
        </div>

            {/* Search Bar - Modern Design */}
            <div className="relative">
          <input
            type="text"
                placeholder="🔍 Search by name, email, phone, or rental ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100/50 focus:bg-white focus:shadow-lg transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium shadow-sm hover:shadow-md"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
        </div>
      </div>

        {/* Rentals List - Modern Card Design */}
        <div className="space-y-6">
        {filteredRentals.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-dashed border-gray-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-transparent to-purple-50/30"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-12 h-12 text-violet-500" />
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">No rentals found</p>
                <p className="text-gray-600">Try adjusting your filters or add a new rental</p>
              </div>
          </div>
        ) : (
            filteredRentals.map((rental, index) => {
            const rentalId = rental._id || rental.id;
              const statusColors = {
                'Active': 'from-green-500 via-emerald-500 to-green-600',
                'Completed': 'from-blue-500 via-cyan-500 to-blue-600',
                'Cancelled': 'from-red-500 via-rose-500 to-red-600',
                'On Hold': 'from-yellow-500 via-amber-500 to-yellow-600'
              };
              const statusBg = {
                'Active': 'bg-green-50 border-green-200',
                'Completed': 'bg-blue-50 border-blue-200',
                'Cancelled': 'bg-red-50 border-red-200',
                'On Hold': 'bg-yellow-50 border-yellow-200'
              };
              
            return (
              <div
                key={rentalId}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl border border-white/50 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-violet-50/30 group-hover:via-purple-50/20 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none"></div>
                  <div className="relative z-10">
                    {/* Card Header with Enhanced Gradient */}
                    <div className={`relative bg-gradient-to-r ${statusColors[rental.status] || 'from-gray-500 to-gray-600'} p-6 text-white overflow-hidden`}>
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:20px_20px]"></div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-2xl font-extrabold mb-1 drop-shadow-lg">
                        {rental.rental_id || `Rental #${(rental._id || rental.id).slice(-6)}`}
                      </h3>
                          <p className="text-white/90 font-semibold">{rental.customer_name}</p>
                        </div>
                        <div className={`px-5 py-2.5 rounded-xl ${statusBg[rental.status] || 'bg-gray-50 border-gray-200'} border-2 shadow-lg backdrop-blur-sm`}>
                          <span className={`font-bold text-sm ${
                            rental.status === 'Active' ? 'text-green-700' :
                            rental.status === 'Completed' ? 'text-blue-700' :
                            rental.status === 'Cancelled' ? 'text-red-700' :
                            'text-yellow-700'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 relative">
                      {/* Customer Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <EnvelopeIcon className="w-5 h-5 text-white" />
                      </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Email</div>
                            <div className="text-sm font-semibold text-gray-900 truncate">{rental.customer_email}</div>
                      </div>
                      </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <PhoneIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Phone</div>
                            <div className="text-sm font-semibold text-gray-900">{rental.customer_phone}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Start Date</div>
                            <div className="text-sm font-semibold text-gray-900">
                          {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : 'N/A'}
                      </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 group-hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Monthly Rent</div>
                            <div className="text-sm font-semibold text-gray-900">
                              ₹{rental.total_monthly_amount || 0}/mo
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    {rental.customer_address && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-xs text-gray-500 font-medium mb-1">Delivery Address</div>
                        <p className="text-sm font-semibold text-gray-900">
                          {rental.customer_address.street ? 
                              `${rental.customer_address.street}, ${rental.customer_address.city}, ${rental.customer_address.state} ${rental.customer_address.zipcode}, ${rental.customer_address.country}` :
                              (typeof rental.customer_address === 'string' ? rental.customer_address : 'N/A')
                          }
                        </p>
                      </div>
                    )}

                    {/* Items - Modern Card Design */}
                    {rental.items && rental.items.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                          Rental Items ({rental.items.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {rental.items.map((item, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-bold text-gray-900 mb-1">{item.product_name}</h5>
                                  <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
                                    {item.product_type || 'Furniture'}
                                  </span>
                        </div>
                                {item.quantity > 1 && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                    x{item.quantity}
                                  </span>
                    )}
                              </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                                  <span className="text-gray-500">Monthly:</span>
                                  <span className="ml-1 font-bold text-violet-600">₹{item.monthly_price}</span>
                      </div>
                                {item.deposit > 0 && (
                      <div>
                                    <span className="text-gray-500">Deposit:</span>
                                    <span className="ml-1 font-bold text-orange-600">₹{item.deposit}</span>
                      </div>
                                )}
                    </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border-2 border-violet-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Total Deposit</div>
                        <div className="text-2xl font-extrabold text-violet-700">₹{rental.total_deposit || 0}</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Monthly Rent</div>
                        <div className="text-2xl font-extrabold text-blue-700">₹{rental.total_monthly_amount || 0}</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Total Amount</div>
                        <div className="text-2xl font-extrabold text-green-700">
                          ₹{(rental.total_monthly_amount || 0) + (rental.total_deposit || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Records - Modern Design */}
                    {rental.payment_records && rental.payment_records.length > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Payment Records ({rental.payment_records.length})
                          </h4>
                          {(() => {
                            const pendingPayments = rental.payment_records.filter(
                              p => p.status === 'Pending' || p.status === 'Overdue'
                            );
                            return pendingPayments.length > 0 ? (
                              <button
                                onClick={() => handleSendReminders(rentalId)}
                                className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                                title="Send payment reminders to customer"
                              >
                                <EnvelopeIcon className="w-4 h-4" />
                                Send Reminders ({pendingPayments.length})
                              </button>
                            ) : null;
                          })()}
                        </div>
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gradient-to-r from-gray-50 to-violet-50/50">
                              <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Month</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
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
                                      className={`hover:bg-violet-50/30 transition-colors ${isOverdue ? 'bg-red-50/50 border-l-4 border-red-500' : ''}`}
                                  >
                                      <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">
                                      {new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </td>
                                      <td className="px-4 py-3">
                                        <div className="font-bold text-violet-600">₹{payment.amount}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm text-gray-700">
                                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                          payment.status === 'Paid' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' :
                                          payment.status === 'Overdue' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300' :
                                          payment.status === 'Partial' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300' :
                                          'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300'
                                      }`}>
                                        {payment.status}
                                      </span>
                                    </td>
                                      <td className="px-4 py-3">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {/* Send Reminder Button - Only for non-paid payments */}
                                        {payment.status !== 'Paid' && (
                                          <button
                                            onClick={() => handleSendReminderForMonth(rentalId, payment._id)}
                                            disabled={paymentLoading[`reminder-${payment._id}`]}
                                              className="group flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            title="Send reminder email"
                                          >
                                            {paymentLoading[`reminder-${payment._id}`] ? (
                                              <>
                                                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                                                Sending...
                                              </>
                                            ) : (
                                              <>
                                                  <EnvelopeIcon className="w-3.5 h-3.5" />
                                                Remind
                                              </>
                                            )}
                                          </button>
                                        )}
                                        
                                        {/* Update Button - Only for non-paid payments */}
                                        {payment.status !== 'Paid' && (
                                          <button
                                            onClick={() => {
                                              setSelectedRental(rental);
                                              setSelectedPayment(payment);
                                              setShowPaymentUpdateModal(true);
                                            }}
                                              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                                            title="Update payment"
                                          >
                                              <PencilIcon className="w-3.5 h-3.5" />
                                            Update
                                          </button>
                                        )}
                                        
                                        {/* Delete Button - For all payments */}
                                        <button
                                          onClick={() => handleDeletePayment(rentalId, payment._id)}
                                          disabled={paymentLoading[payment._id]}
                                            className="group flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                          title="Delete payment record"
                                        >
                                          {paymentLoading[payment._id] ? (
                                            <>
                                                <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                                              Deleting...
                                            </>
                                          ) : (
                                            <>
                                                <TrashIcon className="w-3.5 h-3.5" />
                                              Delete
                                            </>
                                          )}
                                        </button>
                                        
                                        {/* Paid Date Display - For paid payments */}
                                        {payment.status === 'Paid' && payment.paidDate && (
                                            <span className="text-xs text-gray-600 font-medium bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                                            Paid: {new Date(payment.paidDate).toLocaleDateString()}
                                          </span>
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
                  </div>
                    )}

                    {/* Action Buttons - Modern Design */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedRental(rental);
                          setShowPaymentModal(true);
                        }}
                        className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                        title="Record Payment"
                      >
                        <CurrencyDollarIcon className="w-5 h-5" />
                        Record Payment
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRental(rental);
                          setShowGeneratePaymentsModal(true);
                        }}
                        className="group flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                        title="Generate Payment Records"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Generate Payments
                      </button>
                      <button
                        onClick={() => handleEdit(rental)}
                        className="group flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                        title="Edit Rental"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rentalId)}
                        className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                        title="Delete Rental"
                      >
                        <TrashIcon className="w-5 h-5" />
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

        {/* Modern Pagination with Glassmorphism */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-4 border border-white/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing <span className="font-bold text-violet-600">{(currentPage - 1) * rentalsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-violet-600">
                  {Math.min(currentPage * rentalsPerPage, totalRentals)}
                </span>{' '}
                  of <span className="font-bold text-violet-600">{totalRentals}</span> rentals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                  className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 transform transition-all duration-300"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                Previous
              </button>
              
              {/* Page Numbers */}
                <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transform transition-all duration-300 ${
                        currentPage === pageNum
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50 scale-110'
                            : 'text-gray-700 bg-white border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 hover:scale-105'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                  className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 transform transition-all duration-300"
              >
                Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
              </button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Add/Edit Modal with Glassmorphism */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 animate-slide-up">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-extrabold mb-1 drop-shadow-lg">
                {selectedRental ? 'Edit Rental' : 'Add New Rental'}
              </h2>
                  <p className="text-violet-100 text-sm">
                    {selectedRental ? 'Update rental information' : 'Create a new offline rental'}
                  </p>
                </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Details Section */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border-2 border-violet-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                    Customer Information
                  </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                        className="input-modern w-full"
                        placeholder="Enter customer name"
                  />
                </div>
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                        className="input-modern w-full"
                        placeholder="customer@example.com"
                  />
                </div>
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                    Customer Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                        className="input-modern w-full"
                        placeholder="+91 1234567890"
                  />
                </div>
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                        className="input-modern w-full"
                  >
                    {STATUS_TYPES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                    </div>
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
                  className="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                >
                  {selectedRental ? 'Update' : 'Create'} Rental
                </button>
              </div>
            </form>
            </div>
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

