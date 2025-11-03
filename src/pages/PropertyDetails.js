import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPinIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PropertyMap from '../components/property/PropertyMap';
import { propertyService } from '../services/propertyService';

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!property?.photos?.length) return;

    const interval = setInterval(() => {
      setActiveImage((prevIndex) => (prevIndex + 1) % property.photos.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [property?.photos?.length]);

  const fetchProperty = async () => {
    try {
      console.log('Fetching property with ID:', id);
      const response = await propertyService.getPropertyById(id);
      console.log('Property fetched:', response);
      console.log('Property ID:', response._id);
      setProperty(response);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err.message || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Property not found'}</div>
      </div>
    );
  }

  const handlePrevImage = () => {
    if (!property.photos?.length) return;
    setActiveImage((prevIndex) => (prevIndex - 1 + property.photos.length) % property.photos.length);
  };

  const handleNextImage = () => {
    if (!property.photos?.length) return;
    setActiveImage((prevIndex) => (prevIndex + 1) % property.photos.length);
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    
    if (property.listing_type === 'Rent') {
      return price.rent_monthly ? `₹${price.rent_monthly.toLocaleString()}/month` : 'Rent not specified';
    }
    return price.sell_price ? `₹${price.sell_price.toLocaleString()}` : 'Price not specified';
  };

  const getFullAddress = () => {
    if (!property.address) return 'Address not available';
    
    const parts = [
      property.address.street,
      property.address.city,
      property.address.state,
      property.address.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const imageUrl = property?.photos?.length > 0 && !imageLoadFailed
    ? propertyService.getImageUrl(property.photos[activeImage])
    : null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formError) setFormError('');
    if (formSuccess) setFormSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phoneNumber.trim()) return 'Phone number is required';
    if (!formData.message.trim()) return 'Message is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    // Phone number validation (basic)
    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      return 'Please enter a valid phone number';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setFormError('');
    setFormSuccess('');
    
    // Validate form
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    
    // Check if property exists
    if (!property || !property._id) {
      setFormError('Property not found. Please try refreshing the page.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use property_id (string ID like "PROP-2024-1028-ABC123") not _id (MongoDB ObjectId)
      const propertyId = property.property_id || property._id;
      
      const requestData = {
        property_id: propertyId,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        message: formData.message
      };
      
      console.log('Property object:', property);
      console.log('Property ID field:', property.property_id);
      console.log('Property _id field:', property._id);
      console.log('Using property_id:', propertyId);
      console.log('Submitting property request:', requestData);
      
      await propertyService.submitPropertyRequest(requestData);
      
      setFormSuccess('Your request has been submitted successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting property request:', error);
      setFormError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRandomBgColor = () => {
    const colors = [
      'bg-violet-100',
      'bg-violet-200',
      'bg-purple-100',
      'bg-purple-200',
      'bg-indigo-100',
      'bg-indigo-200'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 relative">
          <div className="relative h-[60vh]">
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl}
                  alt={property.name || 'Property Image'}
                  className="w-full h-full object-cover"
                  onError={() => setImageLoadFailed(true)}
                  loading="lazy"
                />
                {property.photos.length > 1 && !imageLoadFailed && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {property.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`w-3 h-3 rounded-full ${
                            activeImage === index ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {property.name || 'Property Name Not Available'}
                </h1>
                <div className="flex items-center text-gray-500 mt-2">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{getFullAddress()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-violet-600">
                  {formatPrice(property.price)}
                </p>
                {property.listing_type === 'Rent' && property.price?.deposit && (
                  <p className="text-gray-600">
                    Deposit: ₹{property.price.deposit.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
              <div className="text-center">
                <span className="block text-gray-500">{property.bhk || 'N/A'}</span>
                <span className="text-sm text-gray-400">BHK</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">{property.bathrooms || 'N/A'}</span>
                <span className="text-sm text-gray-400">Bathrooms</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">{property.size || 'N/A'}</span>
                <span className="text-sm text-gray-400">Area (sq.ft)</span>
              </div>
            </div>

            {/* Description */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{property.description || 'No description available'}</p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities?.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <div 
                      key={index} 
                      className={`${getRandomBgColor()} rounded-lg p-3 flex items-center justify-center text-center`}
                    >
                      <span className="text-violet-800 font-medium">
                        {amenity.trim().toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No amenities listed</div>
                )}
              </div>
            </div>

            {/* Location */}
            {property.location_coordinates && (
              <div className="py-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <PropertyMap property={property} />
              </div>
            )}

            {/* Contact Form */}
            <div className="py-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Contact Owner</h2>
              
              {formSuccess && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                  {formSuccess}
                </div>
              )}
              
              {formError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg text-white font-medium ${
                    isSubmitting 
                      ? 'bg-violet-400 cursor-not-allowed' 
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails; 