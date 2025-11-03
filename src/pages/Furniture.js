import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { furnitureService } from '../services/furnitureService';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const furnitureData = [
  {
    id: 1,
    name: "Modern L-Shaped Sofa Set",
    price: "₹45,999",
    rentPrice: "₹2,499/month",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Living Room",
    description: "Contemporary 6-seater L-shaped sofa with premium fabric upholstery",
    features: ["Premium Fabric", "High-Density Foam", "Solid Wood Frame", "5 Year Warranty"]
  },
  {
    id: 2,
    name: "Queen Size Bed with Storage",
    price: "₹32,999",
    rentPrice: "₹1,899/month",
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Bedroom",
    description: "Modern queen size bed with hydraulic storage and premium mattress",
    features: ["Hydraulic Storage", "Engineered Wood", "Premium Finish", "3 Year Warranty"]
  },
  {
    id: 3,
    name: "6-Seater Dining Set",
    price: "₹28,999",
    rentPrice: "₹1,699/month",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Dining Room",
    description: "Contemporary dining set with glass top and comfortable chairs",
    features: ["Tempered Glass Top", "Cushioned Chairs", "Powder Coated Frame", "2 Year Warranty"]
  },
  {
    id: 4,
    name: "TV Entertainment Unit",
    price: "₹18,999",
    rentPrice: "₹999/month",
    image: "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Living Room",
    description: "Modern TV unit with ample storage and sleek design",
    features: ["Wall Mounted", "Multiple Compartments", "Back Panel for TV", "2 Year Warranty"]
  },
  {
    id: 5,
    name: "Study Table with Bookshelf",
    price: "₹12,999",
    rentPrice: "₹799/month",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Study Room",
    description: "Compact study table with integrated bookshelf and drawer",
    features: ["Multiple Storage", "Cable Management", "Ergonomic Design", "1 Year Warranty"]
  },
  {
    id: 6,
    name: "Premium Washing Machine",
    price: "₹35,999",
    rentPrice: "₹1,499/month",
    image: "https://images.unsplash.com/photo-1626806787461-7e32501b5ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Appliances",
    description: "Fully automatic washing machine with advanced features",
    features: ["Fully Automatic", "Energy Efficient", "Multiple Wash Programs", "2 Year Warranty"]
  },
  {
    id: 7,
    name: "Double Door Refrigerator",
    price: "₹42,999",
    rentPrice: "₹2,299/month",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d0b7b4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Appliances",
    description: "Large capacity refrigerator with advanced cooling technology",
    features: ["350L Capacity", "Frost Free", "Digital Display", "3 Year Warranty"]
  },
  {
    id: 8,
    name: "55-inch Smart LED TV",
    price: "₹69,999",
    rentPrice: "₹2,999/month",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Appliances",
    description: "Ultra HD Smart TV with built-in Android and voice control",
    features: ["4K UHD", "Smart TV", "Voice Control", "2 Year Warranty"]
  }
];

function Furniture() {
  const [selectedTab, setSelectedTab] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Furniture & Appliances</h1>
          <p className="text-lg text-gray-600">
            Buy or rent premium furniture and appliances for your home
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}

        <Tab.Group>
          <Tab.List className="flex space-x-4 border-b border-gray-200 mb-8">
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium border-b-2 ${
                  selected
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Buy
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium border-b-2 ${
                  selected
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Rent
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {furnitureData.map(item => (
                  <FurnitureCard 
                    key={item.id} 
                    furniture={item} 
                    mode="buy"
                    setError={setError}
                    setSuccess={setSuccess}
                  />
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {furnitureData.map(item => (
                  <FurnitureCard 
                    key={item.id} 
                    furniture={item} 
                    mode="rent"
                    setError={setError}
                    setSuccess={setSuccess}
                  />
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

function FurnitureCard({ furniture, mode, setError, setSuccess }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      >
        <div className="relative h-64">
          <img 
            src={furniture.image} 
            alt={furniture.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image';
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {furniture.category}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{furniture.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{furniture.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {furniture.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            ))}
          </div>
          
          <p className="text-violet-600 font-bold text-2xl mb-4">
            {mode === 'buy' ? furniture.price : furniture.rentPrice}
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-violet-500 text-white py-3 rounded-lg hover:bg-violet-600 transition-colors font-medium"
          >
            {mode === 'buy' ? 'Buy Now' : 'Rent Now'}
          </button>
        </div>
      </motion.div>

      {showModal && (
        <RequestModal 
          furniture={furniture} 
          mode={mode}
          onClose={() => setShowModal(false)}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
    </>
  );
}

function RequestModal({ furniture, mode, onClose, setError, setSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    duration: mode === 'rent' ? '1' : '',
    message: '',
    preferred_date: '',
    preferred_time: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await furnitureService.submitFurnitureRequest({
        furniture_id: furniture.id,
        type: mode,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        duration: formData.duration,
        message: formData.message,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time
      });

      setSuccess(`Your ${mode} request for ${furniture.name} has been submitted successfully! We'll contact you shortly.`);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.message || `Failed to submit ${mode} request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {mode === 'buy' ? 'Purchase Request' : 'Rental Request'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">{furniture.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{furniture.description}</p>
          <p className="text-violet-600 font-bold text-lg">
            {mode === 'buy' ? furniture.price : furniture.rentPrice}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Enter your complete address"
            />
          </div>

          {mode === 'rent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Duration *
              </label>
              <select 
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Select Duration</option>
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Select time</option>
                <option value="09:00-12:00">Morning (9 AM - 12 PM)</option>
                <option value="12:00-15:00">Afternoon (12 PM - 3 PM)</option>
                <option value="15:00-18:00">Evening (3 PM - 6 PM)</option>
                <option value="18:00-20:00">Night (6 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Any special requirements or questions?"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : `Submit ${mode === 'buy' ? 'Purchase' : 'Rental'} Request`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Furniture; 