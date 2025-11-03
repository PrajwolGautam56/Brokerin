import { useState, useEffect } from 'react';
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
        // Get first 6 properties for featured section
        setProperties(response.properties.slice(0, 6));
      } else {
        setError('No properties found');
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
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
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="gradient-text">Featured Properties</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover our hand-picked properties tailored just for you</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <Link 
              key={property._id} 
              to={`/property/${property._id}`}
              className="block card-modern group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={propertyService.getImageUrl(property.photos[0])}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400">No image available</div>';
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400">
                    No image available
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {property.listing_type}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-1">
                  {property.name || 'Unnamed Property'}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-1">{property.location}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{property.bhk} BHK</span>
                  <span>{property.bathrooms} Bath</span>
                  <span>{property.carpet_area} sq.ft</span>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex-shrink-0">
                    <span className="text-sm text-gray-500 block">Price</span>
                    <p className="font-semibold text-lg whitespace-nowrap">
                      {property.listing_type === 'Rent'
                        ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
                        : `₹${property.price?.sell_price?.toLocaleString()}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ${
                    property.status === 'Available' 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16 animate-fade-in">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-violet transform hover:scale-105 transition-all duration-300 gap-2"
          >
            View All Properties
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 