import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertyService.getAllProperties();
      if (response && Array.isArray(response.properties)) {
        // Get first 3 properties for featured section
        setProperties(response.properties.slice(0, 3));
      } else {
        setError('No properties found');
      }
    } catch (error) {
      logger.error('Error fetching featured properties:', error);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-gray-500">{error}</div>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Featured Properties
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked homes for your perfect lifestyle
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {properties.map((property, index) => (
            <Link 
              key={property._id} 
              to={`/property/${property._id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-56 md:h-64 overflow-hidden bg-gray-200">
                {property.photos && property.photos.length > 0 ? (
                  <>
                    <img
                      src={propertyService.getImageUrl(property.photos[0])}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="18"%3ENo image%3C/text%3E%3C/svg%3E';
                      }}
                      loading="lazy"
                    />
                    {/* Image Count Badge */}
                    {property.photos.length > 1 && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {property.photos.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Listing Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm ${
                    property.listing_type === 'Rent'
                      ? 'bg-violet-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {property.listing_type}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${
                    property.status === 'Available' 
                      ? 'bg-green-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {property.status}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                {/* Title and Location */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1.5 line-clamp-1 group-hover:text-violet-600 transition-colors">
                    {property.name || 'Unnamed Property'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{property.location || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  {property.bhk && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium">{property.bhk} BHK</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span className="text-sm font-medium">{property.bathrooms} Bath</span>
                    </div>
                  )}
                  {property.carpet_area && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-sm font-medium">{property.carpet_area} sq.ft</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block mb-0.5">
                      {property.listing_type === 'Rent' ? 'Monthly Rent' : 'Price'}
                    </span>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {property.listing_type === 'Rent'
                        ? `₹${property.price?.rent_monthly?.toLocaleString('en-IN')}/mo`
                        : `₹${property.price?.sell_price?.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-0 md:mt-12">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 gap-2"
          >
            View All Properties
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 