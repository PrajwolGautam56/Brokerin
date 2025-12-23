import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { formatPrice, formatPriceWithSuffix } from '../../utils/priceFormatter';

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
              ? formatPriceWithSuffix(property.price?.rent_monthly, '/month')
              : formatPrice(property.price?.sell_price),
            status: property.status || 'Status not available',
            imageUrl: property.photos?.length > 0 
              ? propertyService.getImageUrl(property.photos[0])
              : null
          }));
        setPreviewProperties(validProperties);
      }
    } catch (error) {
      logger.error('Error fetching preview properties:', error);
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
    <div className="pt-20 pb-16 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1223] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-12 w-80 h-80 bg-violet-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 -left-16 w-96 h-96 bg-cyan-400/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-sm font-semibold text-cyan-100 px-3 py-2 rounded-full backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              A great platform to buy or rent properties easily.
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Trust In.
              
                <span className="block text-cyan-200">Broker In.</span>
              </h1>
              <p className="text-gray-200 text-lg mt-4 max-w-2xl leading-relaxed">
              Your trusted partner in finding the perfect home and services. We make property search simple, fast, and reliable.
              </p>
            </div>

            {/* Trust bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Verified homes', icon: '✓' },
                { label: 'No hidden Charges', icon: '₹' },
                { label: '24x7 support', icon: '⚡' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <span className="text-cyan-300 text-base">{item.icon}</span>
                  <span className="text-gray-200 font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Search card */}
            <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                  {['rent', 'buy'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFormType(type);
                        setSearchParams((prev) => ({ ...prev, type }));
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        formType === type ? 'bg-white shadow text-violet-600' : 'text-gray-500'
                      }`}
                    >
                      {type === 'rent' ? 'Rent Homes' : 'Buy Homes'}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  4K+ options
                </span>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="Try Koramangala, HSR Layout, Whitefield..."
                      value={searchParams.location}
                      onChange={(e) => setSearchParams((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
                    <select
                      value={searchParams.propertyType}
                      onChange={(e) => setSearchParams((prev) => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Any</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">Independent House</option>
                      <option value="villa">Villa</option>
                      <option value="pg">PG / Co-living</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Search homes
                </button>
              </form>
            </div>
          </div>

          {/* Right: live preview cards */}
          <div className="space-y-4">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-white backdrop-blur-sm">
              <p className="text-sm text-gray-300">Handpicked for you</p>
              <h3 className="text-xl font-semibold text-white mt-1">Instant move-in homes</h3>
            </div>
            {previewProperties.length > 0 ? (
              previewProperties.map((property, index) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="block transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PropertyPreviewCard property={property} />
                </Link>
              ))
            ) : (
              <div className="text-gray-300">No properties available for preview</div>
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