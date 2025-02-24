import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { Link } from 'react-router-dom';

function PropertyListing() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    location: '',
    priceRange: 'all'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getAllProperties();
      setProperties(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          
          {/* Filter Controls */}
          <div className="flex gap-4">
            <select 
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="all">All Types</option>
              <option value="Rent">For Rent</option>
              <option value="Sale">For Sale</option>
            </select>

            <select 
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        </div>
        
        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties
            .filter(property => 
              (filters.type === 'all' || property.listing_type === filters.type) &&
              (!filters.location || property.location === filters.location)
            )
            .map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No properties available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property }) {
  const amenities = propertyService.formatAmenities(property.amenities[0] || '');
  const imageUrl = property.photos?.length > 0 
    ? propertyService.getImageUrl(property.photos[0])
    : '/images/placeholder.jpg';

  return (
    <Link 
      to={`/property/${property._id}`}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Property Image */}
      <div className="relative h-48">
        <img 
          src={imageUrl}
          alt={property.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
            e.target.onerror = null;
          }}
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'Available' 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {property.name.replace(/"/g, '')}
            </h3>
            <p className="text-gray-600">{property.location}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">{property.listing_type}</span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">{property.bhk}</span> BHK
          </div>
          <div>
            <span className="font-medium">{property.bathrooms}</span> Baths
          </div>
          <div>
            <span className="font-medium">{property.size}</span> sq.ft
          </div>
        </div>

        {/* Amenities */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
              >
                {amenity.trim()}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-gray-500 text-xs">+{amenities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="text-gray-600">
            {property.furnishing} Furnished
          </div>
          <div className="text-violet-600 font-medium">
            {property.availability}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyListing; 