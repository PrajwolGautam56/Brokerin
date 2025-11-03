import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';

function Hero() {
  const navigate = useNavigate();
  const [formType, setFormType] = useState('rent');
  const [searchParams, setSearchParams] = useState({
    type: 'rent',
    location: '',
    propertyType: '',
  });
  const [previewProperties, setPreviewProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreviewProperties();
  }, []); // Only run once on mount

  const fetchPreviewProperties = async () => {
    try {
      const response = await propertyService.getAllProperties();
      if (response && Array.isArray(response.properties)) {
        // Get first 3 properties
        const validProperties = response.properties
          .slice(0, 3)
          .map(property => ({
            id: property._id,
            title: property.name?.replace(/"/g, '') || 'Property Title',
            bedrooms: property.bhk || 0,
            bathrooms: property.bathrooms || 0,
            location: property.location || 'Location not available',
            price: property.listing_type === 'Rent' 
              ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
              : `₹${property.price?.sell_price?.toLocaleString()}`,
            status: property.status || 'Status not available',
            imageUrl: property.photos?.length > 0 
              ? propertyService.getImageUrl(property.photos[0])
              : null
          }));
        setPreviewProperties(validProperties);
      }
    } catch (error) {
      console.error('Error fetching preview properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/properties', { 
      state: searchParams,
      search: `?type=${searchParams.type}`
    });
  };

  return (
    <div className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-violet-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Left Side */}
          <div className="lg:w-1/2 animate-slide-up">
            <p className="text-violet-600 mb-4 mt-6 text-lg font-medium">
              A great platform to buy or rent properties easily.
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">Trust In.</span>
              <br />
              <span className="text-gray-900">Broker In.</span>
            </h1>
            
            {/* Stats */}
            <div className="flex gap-12 mb-12">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <h3 className="text-4xl font-bold gradient-text">500+</h3>
                <p className="text-gray-600 mt-2 font-medium">Happy Customers</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <h3 className="text-4xl font-bold gradient-text">1K+</h3>
                <p className="text-gray-600 mt-2 font-medium">Properties</p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-modern-lg border border-white/50">
              <div className="flex justify-center gap-8 mb-8">
                <button 
                  onClick={() => {
                    setFormType('rent');
                    setSearchParams(prev => ({ ...prev, type: 'rent' }));
                  }}
                  className={`pb-3 px-6 font-semibold transition-all duration-300 ${
                    formType === 'rent' 
                      ? 'text-violet-600 border-b-2 border-violet-600 scale-105' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Rent
                </button>
                <button 
                  onClick={() => {
                    setFormType('buy');
                    setSearchParams(prev => ({ ...prev, type: 'buy' }));
                  }}
                  className={`pb-3 px-6 font-semibold transition-all duration-300 ${
                    formType === 'buy' 
                      ? 'text-violet-600 border-b-2 border-violet-600 scale-105' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Buy
                </button>
              </div>

              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Location */}
                  <div className="col-span-2">
                    <label className="block text-gray-600 mb-2">Location</label>
                    <input 
                      type="text" 
                      placeholder="Enter location"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-gray-600 mb-2">Property Type</label>
                    <select 
                      value={searchParams.propertyType}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Select Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">Independent House</option>
                      <option value="villa">Villa</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="plot">Plot</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-violet transform hover:scale-[1.02]"
                >
                  Search Properties
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Property Preview Cards */}
          <div className="lg:w-1/2 space-y-6 lg:mt-1 animate-slide-up">
            {previewProperties.length > 0 ? (
              previewProperties.map((property, index) => (
                <Link 
                  key={property.id} 
                  to={`/property/${property.id}`}
                  className="block transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PropertyPreviewCard property={property} />
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No properties available for preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// PropertyPreviewCard Component
function PropertyPreviewCard({ property }) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  return (
    <div className="card-modern group">
      <div className="flex p-5">
        <div className="w-44 h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          {property.imageUrl && !imageLoadFailed ? (
            <img 
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageLoadFailed(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="ml-5 flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-violet-600 transition-colors">{property.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <span className="font-medium">{property.bedrooms}</span> bedroom
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">{property.bathrooms}</span> bath
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
          <div className="flex justify-between items-center">
            <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm">
              {property.status}
            </span>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">from</span>
              <p className="font-bold text-lg gradient-text">{property.price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero; 