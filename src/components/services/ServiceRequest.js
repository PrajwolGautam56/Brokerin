import { useState } from 'react';
import { motion } from 'framer-motion';

function ServiceRequest({ service, onClose }) {
  const [formData, setFormData] = useState({
    services: [{
      service: service.name,
      quantity: 1
    }],
    scheduledDate: '',
    scheduledTimeSlot: '',
    notes: '',
    contactDetails: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });

  const timeSlots = [
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This will be replaced with API call
    console.log(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Book {service.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{service.name}</p>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              {service.pricing.type === 'fixed' && (
                <p className="text-brand-violet font-medium mt-2">
                  ₹{service.pricing.amount} {service.pricing.unit}
                </p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.scheduledDate}
                onChange={(e) => setFormData({
                  ...formData,
                  scheduledDate: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                value={formData.scheduledTimeSlot}
                onChange={(e) => setFormData({
                  ...formData,
                  scheduledTimeSlot: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                required
              >
                <option value="">Select time slot</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.contactDetails.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactDetails: {
                      ...formData.contactDetails,
                      name: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactDetails.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactDetails: {
                      ...formData.contactDetails,
                      phone: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contactDetails.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contactDetails: {
                    ...formData.contactDetails,
                    email: e.target.value
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Address
              </label>
              <textarea
                value={formData.contactDetails.address}
                onChange={(e) => setFormData({
                  ...formData,
                  contactDetails: {
                    ...formData.contactDetails,
                    address: e.target.value
                  }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({
                ...formData,
                notes: e.target.value
              })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-violet focus:border-brand-violet"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-violet text-white py-3 rounded-lg hover:bg-brand-violet/90 transition-colors"
          >
            Book Service
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default ServiceRequest; 