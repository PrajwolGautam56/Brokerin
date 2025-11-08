import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { furnitureService } from '../services/furnitureService';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Furniture() {
  const [selectedTab, setSelectedTab] = useState('rent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    listingType: '',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchFurniture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTab]);

  const fetchFurniture = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params - use API filtering based on selected tab
      const queryParams = {
        status: 'Available', // Only show available items
        page: filters.page,
        limit: 100 // Get more items to ensure we see them all
      };
      
      // Note: The API might not support listingType filter, so we'll filter client-side
      // Try to get both types and filter based on what the API returns
      
      // Add category filter if selected
      if (filters.category) {
        queryParams.category = filters.category;
      }
      
      console.log('Fetching furniture with filters:', queryParams);
      console.log('Current tab:', selectedTab);
      const data = await furnitureService.getAllFurniture(queryParams);
      console.log('Furniture response:', data);
      
      // Handle different response formats
      let furnitureData = [];
      if (data.furniture && Array.isArray(data.furniture)) {
        furnitureData = data.furniture;
      } else if (data.data && Array.isArray(data.data)) {
        furnitureData = data.data;
      } else if (Array.isArray(data)) {
        furnitureData = data;
      }
      
      // Parse features for each furniture item to handle stringified JSON
      furnitureData = furnitureData.map(item => {
        if (item.features && typeof item.features === 'string') {
          try {
            const parsed = JSON.parse(item.features);
            if (Array.isArray(parsed)) {
              item.features = parsed;
            }
          } catch (e) {
            // If parsing fails, try to split by comma if it's a plain string
            if (item.features.includes(',')) {
              item.features = item.features.split(',').map(f => f.trim()).filter(f => f);
            } else {
              item.features = [item.features];
            }
          }
        }
        return item;
      });
      
      console.log('Filtered furniture from API:', furnitureData);
      console.log('Item count before filtering:', furnitureData.length);
      
      // Filter by listingType and ensure price exists
      if (selectedTab === 'rent') {
        furnitureData = furnitureData.filter(item => {
          const listingType = item.listingType || item.listing_type;
          const isRentOrBoth = listingType === 'Rent' || listingType === 'Rent & Sell';
          const hasRentPrice = !!item.price?.rent_monthly;
          console.log(`Item: ${item.name}, listingType: ${listingType}, isRentOrBoth: ${isRentOrBoth}, hasRentPrice: ${hasRentPrice}`);
          return isRentOrBoth && hasRentPrice;
        });
      } else if (selectedTab === 'buy') {
        furnitureData = furnitureData.filter(item => {
          const listingType = item.listingType || item.listing_type;
          const isSellOrBoth = listingType === 'Sell' || listingType === 'Rent & Sell';
          const hasSellPrice = !!item.price?.sell_price;
          return isSellOrBoth && hasSellPrice;
        });
      }
      
      console.log('After filtering by listingType:', furnitureData);
      console.log('Item count after filtering:', furnitureData.length);
      
      setFurnitureItems(furnitureData);
      
      if (furnitureData.length === 0) {
        setError('No furniture items found. Please check back later.');
      }
    } catch (err) {
      console.error('Error fetching furniture:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load furniture items.');
      setFurnitureItems([]);
    } finally {
      setLoading(false);
    }
  };

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

        <Tab.Group selectedIndex={selectedTab === 'rent' ? 1 : 0} onChange={(index) => {
          console.log('Tab changed to index:', index);
          const newTab = index === 1 ? 'rent' : 'buy';
          console.log('Setting selectedTab to:', newTab);
          setSelectedTab(newTab);
        }}>
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {furnitureItems
                    .filter(item => selectedTab === 'buy' ? true : true) // Can filter by availability
                    .map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="buy"
                        setError={setError}
                        setSuccess={setSuccess}
                      />
                    ))}
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {furnitureItems
                    .filter(item => selectedTab === 'rent' ? true : true) // Can filter by availability
                    .map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="rent"
                        setError={setError}
                        setSuccess={setSuccess}
                      />
                    ))}
                </div>
              )}
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
            src={furniture.photos && furniture.photos.length > 0 ? furniture.photos[0] : furniture.image || 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image'} 
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
          {furniture.brand && (
            <div className="absolute top-4 right-4">
              <span className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium">
                {furniture.brand}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{furniture.name}</h3>
          <p className="text-gray-600 text-sm mb-1">{furniture.item_type || furniture.category}</p>
          {furniture.condition && (
            <p className="text-gray-500 text-xs mb-2">Condition: {furniture.condition}</p>
          )}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{furniture.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {furniture.features && furniture.features.length > 0 ? furniture.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            )) : furniture.condition && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {furniture.condition}
              </span>
            )}
          </div>
          
          <div className="mb-4">
            {/* Show price based on listing type and current mode */}
            {(furniture.listingType || furniture.listing_type) === 'Rent & Sell' ? (
              <div>
                <p className="text-violet-600 font-bold text-2xl">
                  {mode === 'buy' 
                    ? (furniture.price?.sell_price ? `₹${furniture.price.sell_price}` : 'Price on request')
                    : (furniture.price?.rent_monthly ? `₹${furniture.price.rent_monthly}/month` : 'Price on request')
                  }
                </p>
                {mode === 'buy' && furniture.price?.sell_price && furniture.price?.rent_monthly && (
                  <p className="text-xs text-gray-500 mt-1">Also available for rent: ₹{furniture.price.rent_monthly}/month</p>
                )}
                {mode === 'rent' && furniture.price?.rent_monthly && furniture.price?.sell_price && (
                  <p className="text-xs text-gray-500 mt-1">Or buy for: ₹{furniture.price.sell_price}</p>
                )}
              </div>
            ) : (
              <p className="text-violet-600 font-bold text-2xl">
                {mode === 'buy' 
                  ? (furniture.price?.sell_price ? `₹${furniture.price.sell_price}` : 'Price on request')
                  : (furniture.price?.rent_monthly ? `₹${furniture.price.rent_monthly}/month` : 'Price on request')
                }
              </p>
            )}
            {mode === 'rent' && furniture.price?.deposit && (
              <p className="text-sm text-gray-600">+ ₹{furniture.price.deposit} deposit</p>
            )}
            {furniture.delivery_available && (
              <p className="text-xs text-green-600 mt-1">✓ Delivery Available</p>
            )}
          </div>
          
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
  const { user, isAuthenticated } = useAuth();
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

  useEffect(() => {
    // If logged in, prefill from user and lock those fields
    if (isAuthenticated && isAuthenticated() && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Use furniture_id if available (from API), otherwise fall back to id
      const furnitureId = furniture.furniture_id || furniture._id || furniture.id;
      
      console.log('Submitting furniture request with ID:', furnitureId);
      
      // Validate required fields when user details missing
      const effectivePhone = formData.phone || user?.phoneNumber || user?.phone || '';
      if (!effectivePhone) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      await furnitureService.submitFurnitureRequest({
        furniture_id: furnitureId,
        type: mode,
        // If user is logged in, use account details
        userId: user?.id || user?._id,
        name: formData.name || user?.fullName || user?.name,
        email: formData.email || user?.email,
        phone: effectivePhone,
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
            {mode === 'buy' 
              ? (furniture.price?.sell_price ? `₹${furniture.price.sell_price}` : 'Price on request')
              : (furniture.price?.rent_monthly ? `₹${furniture.price.rent_monthly}/month` : 'Price on request')
            }
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
                disabled={(isAuthenticated && isAuthenticated()) && !!(user?.fullName || user?.name)}
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
                disabled={(isAuthenticated && isAuthenticated()) && !!user?.email}
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
              disabled={(isAuthenticated && isAuthenticated()) && !!(user?.phoneNumber || user?.phone)}
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