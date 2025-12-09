import { useParams, useNavigate, useLocation } from 'react-router-dom';
import logger from '../utils/logger';
import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { furnitureService } from '../services/furnitureService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatPriceWithSuffix } from '../utils/priceFormatter';
import { motion } from 'framer-motion';
import { useFurnitureCart } from '../context/FurnitureCartContext';
import WishlistButton from '../components/wishlist/WishlistButton';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import RatingStars from '../components/reviews/RatingStars';

function FurnitureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addItem, items } = useFurnitureCart();
  const locationItem = location.state?.item;
  
  const [furniture, setFurniture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  // Pre-fill form data when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.fullName || prev.name,
        email: user.email || prev.email,
        phoneNumber: user.phoneNumber || user.phone || prev.phoneNumber
      }));
    }
  }, [user]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState('rent'); // rent or buy
  const [reviewsKey, setReviewsKey] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchFurniture = useCallback(async () => {
    try {
      if (!id) {
        setError('Missing furniture id');
        setLoading(false);
        return;
      }
      logger.log('Fetching furniture with ID:', id);
      const response = await furnitureService.getFurnitureById(id);
      logger.log('Furniture fetched:', response);
      
      const furnitureData = response.furniture || response.data || response;
      setFurniture(furnitureData);
    } catch (err) {
      logger.error('Error fetching furniture:', err);
      // If we already have data from navigation state, keep showing it
      if (locationItem) {
        setFurniture(locationItem);
      } else {
        setError(err.message || 'Failed to fetch furniture details');
      }
    } finally {
      setLoading(false);
    }
  }, [id, locationItem]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Seed from navigation state if available to avoid empty screen when API fails
    if (locationItem) {
      setFurniture(locationItem);
    }
    fetchFurniture();
    
    // Determine mode from URL or default to rent
    const searchParams = new URLSearchParams(location.search);
    setMode(searchParams.get('mode') || 'rent');
  }, [id, location.search, locationItem, fetchFurniture]);

  useEffect(() => {
    if (!furniture?.photos?.length) return;

    const interval = setInterval(() => {
      setActiveImage((prevIndex) => (prevIndex + 1) % furniture.photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [furniture?.photos?.length]);

  // Reset added state after 2 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormError('');
    setFormSuccess('');

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const requestData = {
        furniture_id: furniture._id || furniture.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        message: formData.message,
        type: mode // 'buy' or 'rent'
      };

      await furnitureService.submitFurnitureRequest(requestData);
      
      setFormSuccess('Request submitted successfully! We will contact you soon.');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        message: ''
      });
      setShowModal(false);
      
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err) {
      logger.error('Error submitting request:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % furniture.photos.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + furniture.photos.length) % furniture.photos.length);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !furniture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Furniture Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The furniture item you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/furniture')}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Back to Furniture
          </button>
        </div>
      </div>
    );
  }

  const listingType = furniture.listingType || furniture.listing_type || 'Rent';
  const canRent = listingType === 'Rent' || listingType === 'Rent & Sell';
  const canBuy = listingType === 'Sell' || listingType === 'Rent & Sell';
  
  // Check if furniture is available for cart (in stock)
  const isInStock = () => {
    if (!furniture) return false;
    const stock = furniture.stock ?? furniture.stock_count ?? 0;
    const availability = furniture.availability || furniture.status || 'Available';
    const status = furniture.status || 'Available';
    
    // Available if stock > 0 and availability/status is "Available"
    return stock > 0 && availability === 'Available' && status === 'Available';
  };

  const isAvailable = isInStock();

  // Check if item is already in cart
  const currentMode = canRent ? 'rent' : 'buy';
  const cartItem = items.find(item => 
    (item.id === furniture._id || item.id === furniture.id) && item.mode === currentMode
  );
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (isAddingToCart || addedToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        id: furniture._id || furniture.id,
        name: furniture.name,
        mode: currentMode,
        image: furniture.photos && furniture.photos.length > 0
          ? furnitureService.getImageUrl(furniture.photos[0])
          : null,
        price: furniture.price,
        quantity: 1,
        category: furniture.category
      });
      setAddedToCart(true);
    } catch (error) {
      logger.error('Error adding to cart:', error);
      setAddedToCart(false);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/furniture')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>Back to Furniture</span>
        </button>

        {/* Success/Error Messages */}
        {formSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {formSuccess}
          </div>
        )}
        {formError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {formError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="relative">
              {furniture.photos && furniture.photos.length > 0 ? (
                <>
                  <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={furnitureService.getImageUrl(furniture.photos[activeImage])}
                      alt={furniture.name}
                      className="w-full h-full object-cover"
                    />
                    {furniture.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImage + 1} / {furniture.photos.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {furniture.photos.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {furniture.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            activeImage === index ? 'border-violet-600' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={furnitureService.getImageUrl(photo)}
                            alt={`${furniture.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 md:h-[500px] rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="flex items-center gap-3 flex-wrap">
                {furniture.category && (
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    {furniture.category}
                  </span>
                )}
                {!isAvailable && (
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    Out of Stock
                  </span>
                )}
                {furniture.brand && (
                  <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    {furniture.brand}
                  </span>
                )}
                {furniture.condition && (
                  <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    {furniture.condition}
                  </span>
                )}
              </div>

              {/* Title with Wishlist */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                  {furniture.name}
                </h1>
                <WishlistButton furnitureId={furniture._id || id} className="mt-2" />
              </div>

              {/* Item Type */}
              {furniture.item_type && (
                <p className="text-lg text-gray-600">{furniture.item_type}</p>
              )}

              {/* Price */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-100">
                {listingType === 'Rent & Sell' ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rent Monthly</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {furniture.price?.rent_monthly 
                          ? formatPriceWithSuffix(furniture.price.rent_monthly, '/month', false)
                          : 'Contact for price'}
                      </p>
                      {furniture.price?.deposit && (
                        <p className="text-sm text-gray-600 mt-1">
                          + {formatPrice(furniture.price.deposit, false)} security deposit
                        </p>
                      )}
                    </div>
                    {furniture.price?.sell_price && (
                      <div className="pt-4 border-t border-violet-200">
                        <p className="text-sm text-gray-600 mb-1">Buy Now</p>
                        <p className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(furniture.price.sell_price, false)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : listingType === 'Rent' ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {furniture.price?.rent_monthly 
                        ? formatPriceWithSuffix(furniture.price.rent_monthly, '/month', false)
                        : 'Contact for price'}
                    </p>
                    {furniture.price?.deposit && (
                      <p className="text-sm text-gray-600 mt-1">
                        + {formatPrice(furniture.price.deposit, false)} security deposit
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {furniture.price?.sell_price 
                        ? formatPrice(furniture.price.sell_price, false)
                        : 'Contact for price'}
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              {furniture.features && furniture.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {furniture.features.map((feature, idx) => (
                      <span key={idx} className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg text-sm font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {furniture.description && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {furniture.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {furniture.delivery_available && (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Free Delivery</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Free Installation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">No Security Deposit</span>
                </div>
              </div>

              {/* CTA Buttons */}
              {isAvailable ? (
                <>
                  {/* In Stock: Show only Add to Cart */}
                  <div className="pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addedToCart}
                      className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        addedToCart
                          ? 'bg-green-600 text-white cursor-default'
                          : isAddingToCart
                          ? 'bg-violet-400 text-white cursor-wait border-0'
                          : 'border border-violet-200 text-violet-700 hover:bg-violet-50'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Adding to Cart...</span>
                        </>
                      ) : addedToCart ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added to Cart!</span>
                        </>
                      ) : cartQuantity > 0 ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                          </svg>
                          <span>Add More ({cartQuantity} in cart)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Out of Stock: Show Out of Stock message and Request for Rent */}
                  <div className="pt-4">
                    <div className="w-full bg-red-50 border-2 border-red-200 text-red-700 py-4 rounded-xl text-center font-bold text-lg mb-4">
                      Out of Stock
                    </div>
                    
                    <div className="flex gap-4">
                      {canRent && (
                        <button
                          onClick={() => {
                            setMode('rent');
                            setShowModal(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          Request for Rent
                        </button>
                      )}
                      {canBuy && (
                        <button
                          onClick={() => {
                            setMode('buy');
                            setShowModal(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          Request for Purchase
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overall Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
              
              {furniture.average_rating > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl font-bold text-violet-600">
                      {furniture.average_rating?.toFixed(1) || '0.0'}
                    </div>
                    <div>
                      <RatingStars rating={furniture.average_rating || 0} size="lg" />
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {furniture.review_count || 0} review{furniture.review_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 mb-4">No reviews yet</p>
              )}

              <button
                onClick={() => {
                  const reviewFormElement = document.getElementById('review-form');
                  reviewFormElement?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-8">
            <ReviewList key={reviewsKey} furnitureId={furniture._id || id} />
            
            <div id="review-form">
              <ReviewForm 
                furnitureId={furniture._id || id}
                onReviewSubmitted={() => setReviewsKey(prev => prev + 1)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
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
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{furniture.name}</h3>
              <p className="text-violet-600 font-bold text-lg">
                {mode === 'buy' 
                  ? (furniture.price?.sell_price ? formatPrice(furniture.price.sell_price) : 'Price on request')
                  : (furniture.price?.rent_monthly ? formatPriceWithSuffix(furniture.price.rent_monthly, '/month') : 'Price on request')
                }
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default FurnitureDetails;

