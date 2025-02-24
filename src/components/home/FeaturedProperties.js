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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-lg text-gray-600">Discover our hand-picked properties for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Link 
              key={property._id} 
              to={`/property/${property._id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={propertyService.getImageUrl(property.photos[0])}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">No image available</div>';
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    No image available
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-violet-100 text-violet-600 px-3 py-1 rounded-full text-sm">
                    {property.listing_type}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  {property.name || 'Unnamed Property'}
                </h3>
                <p className="text-gray-600 mb-4">{property.location}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{property.bhk} BHK</span>
                  <span>{property.bathrooms} Bath</span>
                  <span>{property.carpet_area} sq.ft</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="font-semibold text-lg">
                      {property.listing_type === 'Rent'
                        ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
                        : `₹${property.price?.sell_price?.toLocaleString()}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
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

        <div className="text-center mt-12">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
} 