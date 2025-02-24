import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { propertyService } from '../services/propertyService';

function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    service_type: '',
    name: '',
    phone_number: '',
    preferred_date: '',
    preferred_time: '',
    service_address: '',
    additional_notes: ''
  });

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
    setFormData(prev => ({ ...prev, service_type: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user makes changes
  };

  const validateForm = () => {
    // Service type validation
    if (!formData.service_type || formData.service_type.trim() === '') {
      setError('Please select a service type');
      return false;
    }

    // Name validation (at least 2 words, minimum 3 characters each)
    const nameWords = formData.name.trim().split(/\s+/);
    if (nameWords.length < 2 || nameWords.some(word => word.length < 3)) {
      setError('Please enter your full name (first and last name)');
      return false;
    }

    // Phone number validation (international format)
    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number (+XX XXXXXXXXXX)');
      return false;
    }

    // Date validation
    const selectedDate = new Date(formData.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return false;
    }

    // Time validation (HH:MM format and within business hours 9 AM to 6 PM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.preferred_time)) {
      setError('Time must be in HH:MM format');
      return false;
    }

    const [hours, minutes] = formData.preferred_time.split(':').map(Number);
    if (hours < 9 || (hours === 18 && minutes > 0) || hours > 18) {
      setError('Please select a time between 9:00 AM and 6:00 PM');
      return false;
    }

    // Address validation (minimum length)
    if (formData.service_address.trim().length < 10) {
      setError('Please enter a complete service address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Format the date to match the API's expected format
      const formattedDate = new Date(formData.preferred_date).toISOString();

      const bookingData = {
        ...formData,
        preferred_date: formattedDate,
        service_type: formData.service_type.toLowerCase().replace(/\s+/g, '_')
      };

      console.log('Submitting service booking:', bookingData);
      
      await propertyService.submitServiceBooking(bookingData);
      console.log('Service booking request submitted successfully!');
      setShowForm(false);
      setFormData({
        service_type: '',
        name: '',
        phone_number: '',
        preferred_date: '',
        preferred_time: '',
        service_address: '',
        additional_notes: ''
      });
    } catch (error) {
      console.error('Service booking error:', error);
      setError(error.message || 'Failed to submit service booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - White */}
      <div className="bg-white pt-32 pb-12">
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
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                    >
                      <option value="">Select a service type</option>
                      {selectedService.subCategories.map((subCategory, index) => (
                        <option 
                          key={index} 
                          value={typeof subCategory === 'string' ? subCategory.toLowerCase() : subCategory.name.toLowerCase()}
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
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  {/* Service Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferred_date"
                        value={formData.preferred_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time (HH:MM)
                      </label>
                      <input
                        type="time"
                        name="preferred_time"
                        value={formData.preferred_time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                        placeholder="HH:MM"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Address
                    </label>
                    <textarea
                      name="service_address"
                      value={formData.service_address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      rows="3"
                      placeholder="Enter your address"
                    ></textarea>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      rows="3"
                      placeholder="Any specific requirements or notes"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-brand-violet text-white py-3 rounded-lg transition-colors ${
                      loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-violet/90'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Request Service'}
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