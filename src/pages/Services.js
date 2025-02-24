import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

                <form className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet">
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
                        Name
                      </label>
                      <input
                        type="text"
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
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet">
                        <option value="">Select time slot</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                        <option value="evening">Evening (3 PM - 6 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Address
                    </label>
                    <textarea
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                      rows="3"
                      placeholder="Any specific requirements or notes"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-brand-violet text-white py-3 rounded-lg hover:bg-brand-violet/90 transition-colors"
                  >
                    Request Service
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