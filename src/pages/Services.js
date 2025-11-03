import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import serviceBookingService from '../services/serviceBookingService';
import { useAuth } from '../context/AuthContext';

function Services() {
  const { user, isAuthenticated } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    name: '',
    phone_number: '',
    email: '',
    preferred_date: '',
    preferred_time: '',
    alternate_date: '',
    alternate_time: '',
    service_address: '',
    additional_notes: ''
  });
  useEffect(() => {
    if (isAuthenticated && isAuthenticated() && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone_number: user.phoneNumber || user.phone || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      id: 1,
      category: "Carpentry",
      icon: "🔨",
      image: "/images/services/carpentry.jpg",
      subCategories: [
        "Custom Furniture Making",
        "Wood Repairs",
        "Door & Window Work",
        "Cabinet Installation",
        "Wooden Flooring",
        "Modular Kitchen"
      ]
    },
    {
      id: 2,
      category: "Home Maintenance",
      icon: "🔧",
      image: "/images/services/home_maintenance.jpg",
      subCategories: [
        { name: "Deep Cleaning", price: "₹1999 onwards" },
        { name: "Plumbing", price: "₹299 onwards" },
        { name: "Electrical Work", price: "₹249 onwards" },
        { name: "Pest Control", price: "₹899 onwards" }
      ]
    },
    {
      id: 3,
      category: "Moving & Packing",
      icon: "📦",
      image: "/images/services/packers.webp",
      subCategories: [
        "Packers & Movers",
        "Vehicle Transport",
        "Storage Solutions"
      ]
    },
    {
      id: 4,
      category: "Appliance Services",
      icon: "❄️",
      image: "/images/services/appliance.png",
      subCategories: [
        { name: "AC Service & Repair", price: "₹499 onwards" },
        { name: "Washing Machine Repair", price: "₹349 onwards" },
        { name: "Refrigerator Repair", price: "₹399 onwards" },
        { name: "TV Repair", price: "₹299 onwards" }
      ]
    }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowForm(true);
    // Map category to service_type
    const serviceTypeMap = {
      'Carpentry': 'carpentry',
      'Home Maintenance': 'plumbing',
      'Moving & Packing': 'moving',
      'Appliance Services': 'appliance_repair'
    };
    setFormData(prev => ({
      ...prev,
      service_type: serviceTypeMap[service.category] || 'plumbing'
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.service_type) return 'Please select a service type';
    if (!(formData.name || user?.fullName || user?.name)) return 'Name is required';
    if (!((formData.phone_number || '').trim() || user?.phoneNumber || user?.phone)) return 'Phone number is required';
    if (!formData.preferred_date) return 'Preferred date is required';
    if (!formData.preferred_time) return 'Preferred time is required';
    if (!formData.service_address.trim()) return 'Service address is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Always send exact email if available to match dashboard aggregation
      const payload = {
        ...formData,
        name: formData.name || user?.fullName || user?.name || '',
        phone_number: formData.phone_number || user?.phoneNumber || user?.phone || '',
        email: (user?.email || formData.email || '').trim()
      };
      await serviceBookingService.createBooking(payload);
      setSuccess('Service booking submitted successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        service_type: formData.service_type,
        name: '',
        phone_number: '',
        email: '',
        preferred_date: '',
        preferred_time: '',
        alternate_date: '',
        alternate_time: '',
        service_address: '',
        additional_notes: ''
      });
      
      // Go back to services list after 3 seconds
      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - White */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Home Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select a service category to get started
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid - Light Gray */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showForm ? (
            /* Services Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between"
                >
                  <img
                    src={service.image}
                    alt={service.category}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-3xl">{service.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {service.category}
                      </h3>
                    </div>
                    <div className="space-y-2 mb-6">
                      {service.subCategories.map((subCategory, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-brand-teal" />
                            <span className="text-gray-600">
                              {typeof subCategory === 'string' 
                                ? subCategory 
                                : subCategory.name}
                            </span>
                          </div>
                          {typeof subCategory !== 'string' && (
                            <span className="text-brand-violet font-medium text-sm">
                              {subCategory.price}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleServiceSelect(service)}
                      className="w-full bg-brand-violet text-white py-2.5 px-4 rounded-lg hover:bg-brand-violet/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Book {service.category}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Service Request Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Request {selectedService.category}
                  </h2>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type *
                    </label>
                    <select 
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      required
                    >
                      <option value="">Select a service type</option>
                      {selectedService.subCategories.map((subCategory, index) => (
                        <option 
                          key={index} 
                          value={typeof subCategory === 'string' ? subCategory : subCategory.name}
                        >
                          {typeof subCategory === 'string' ? subCategory : subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        placeholder="Your name"
                        required
                        disabled={(isAuthenticated && isAuthenticated()) && !!(user?.fullName || user?.name)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        placeholder="Your phone number"
                        required
                        disabled={(isAuthenticated && isAuthenticated()) && !!(user?.phoneNumber || user?.phone)}
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      placeholder="Your email address"
                      disabled={(isAuthenticated && isAuthenticated()) && !!user?.email}
                    />
                  </div>

                  {/* Service Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        name="preferred_date"
                        value={formData.preferred_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time *
                      </label>
                      <select 
                        name="preferred_time"
                        value={formData.preferred_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        required
                      >
                        <option value="">Select time slot</option>
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

                  {/* Alternate Date and Time (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternate Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="alternate_date"
                        value={formData.alternate_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternate Time (Optional)
                      </label>
                      <select 
                        name="alternate_time"
                        value={formData.alternate_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      >
                        <option value="">Select time slot</option>
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

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Address *
                    </label>
                    <textarea
                      name="service_address"
                      value={formData.service_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      rows="3"
                      placeholder="Enter your address"
                      required
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      rows="3"
                      placeholder="Any specific requirements or notes"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
                      isSubmitting 
                        ? 'bg-violet-400 cursor-not-allowed' 
                        : 'bg-brand-violet hover:bg-brand-violet/90'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Service'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* CTA Section - White */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Need Regular Services?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get special discounts on regular service bookings
            </p>
            <button className="bg-brand-violet text-white px-8 py-3 rounded-lg hover:bg-brand-violet/90 transition-colors">
              Contact for Custom Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services; 