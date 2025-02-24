import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MapIcon, ViewColumnsIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import PropertiesMap from '../components/property/PropertiesMap';
import PropertyCard from '../components/property/PropertyCard';
import { propertyService } from '../services/propertyService';

function Properties() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    location: searchParams.get('location') || '',
    buildingType: searchParams.get('buildingType') || 'all',
    bhk: searchParams.get('bhk') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    furnishing: searchParams.get('furnishing') || 'all',
    availability: searchParams.get('availability') || 'all',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getAllProperties();
      console.log('API Response:', response); // Log the response for debugging
      
      // Check if response has the expected structure
      if (response && Array.isArray(response.properties)) {
        setProperties(response.properties);
        setPagination(response.pagination || { total: 0, page: 1, pages: 1 });
      } else {
        console.error('Invalid response structure:', response);
        setProperties([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on current filters
  const filteredProperties = Array.isArray(properties) ? properties.filter(property => {
    // Type filter (Rent/Sell)
    if (filters.type !== 'all') {
      if (filters.type === 'buy' && property.listing_type?.toLowerCase() !== 'sell') return false;
      if (filters.type === 'rent' && property.listing_type?.toLowerCase() !== 'rent') return false;
    }

    // Location filter
    if (filters.location && !property.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Building Type filter
    if (filters.buildingType !== 'all' && property.building_type?.toLowerCase() !== filters.buildingType.toLowerCase()) {
      return false;
    }

    // BHK filter
    if (filters.bhk !== 'all' && property.bhk !== parseInt(filters.bhk)) {
      return false;
    }

    // Furnishing filter
    if (filters.furnishing !== 'all' && property.furnishing?.toLowerCase() !== filters.furnishing.toLowerCase()) {
      return false;
    }

    // Price Range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      const price = property.listing_type === 'Rent' 
        ? property.price?.rent_monthly 
        : property.price?.sell_price;

      if (!price) return false;
      
      if (max) {
        if (price < min || price > max) return false;
      } else {
        // For ranges like '100000+'
        if (price < min) return false;
      }
    }

    return true;
  }) : [];

  // Sort filtered properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'price-low':
        const priceA = a.listing_type === 'Rent' ? (a.price?.rent_monthly || 0) : (a.price?.sell_price || 0);
        const priceB = b.listing_type === 'Rent' ? (b.price?.rent_monthly || 0) : (b.price?.sell_price || 0);
        return priceA - priceB;
      case 'price-high':
        const priceHighA = a.listing_type === 'Rent' ? (a.price?.rent_monthly || 0) : (a.price?.sell_price || 0);
        const priceHighB = b.listing_type === 'Rent' ? (b.price?.rent_monthly || 0) : (b.price?.sell_price || 0);
        return priceHighB - priceHighA;
      default:
        return 0;
    }
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value.length > 0) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

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
    <div className="min-h-screen">
      {/* Header Section - White */}
      <div className="bg-white pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Available Properties
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {sortedProperties.length} properties found
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section - Light Gray */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Section */}
          <div className="relative">
            {/* Filters Header */}
            <div className="bg-white shadow-sm mb-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                {/* Type Filter Tabs */}
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                    className={`pb-2 px-8 ${
                      filters.type === 'all' 
                        ? 'text-brand-violet border-b-2 border-brand-violet' 
                        : 'text-gray-400'
                    }`}
                  >
                    All Properties
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, type: 'rent' }))}
                    className={`pb-2 px-8 ${
                      filters.type === 'rent' 
                        ? 'text-violet-500 border-b-2 border-violet-500' 
                        : 'text-gray-400'
                    }`}
                  >
                    For Rent
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, type: 'buy' }))}
                    className={`pb-2 px-8 ${
                      filters.type === 'buy' 
                        ? 'text-violet-500 border-b-2 border-violet-500' 
                        : 'text-gray-400'
                    }`}
                  >
                    For Sale
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <AdjustmentsHorizontalIcon className="h-5 w-5" />
                      Filters
                    </button>
                    <span className="text-gray-600">
                      {filteredProperties.length} properties found
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>

                    <div className="flex gap-2 border rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-gray-600'}`}
                      >
                        <ViewColumnsIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-violet-100 text-violet-600' : 'text-gray-600'}`}
                      >
                        <MapIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter location"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                        <select
                          value={filters.buildingType}
                          onChange={(e) => setFilters(prev => ({ ...prev, buildingType: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="all">All Types</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Independent House">Independent House</option>
                          <option value="Villa">Villa</option>
                          <option value="Plot">Plot</option>
                          <option value="Penthouse">Penthouse</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                        <select
                          value={filters.bhk}
                          onChange={(e) => setFilters(prev => ({ ...prev, bhk: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="all">Any</option>
                          <option value="1">1 BHK</option>
                          <option value="2">2 BHK</option>
                          <option value="3">3 BHK</option>
                          <option value="4">4 BHK</option>
                          <option value="5">5+ BHK</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                        <select
                          value={filters.priceRange}
                          onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="all">Any Price</option>
                          {filters.type === 'rent' ? (
                            <>
                              <option value="0-10000">Under ₹10,000/month</option>
                              <option value="10000-25000">₹10,000 - ₹25,000/month</option>
                              <option value="25000-50000">₹25,000 - ₹50,000/month</option>
                              <option value="50000-100000">₹50,000 - ₹1,00,000/month</option>
                              <option value="100000">Above ₹1,00,000/month</option>
                            </>
                          ) : (
                            <>
                              <option value="0-2500000">Under ₹25 Lakhs</option>
                              <option value="2500000-5000000">₹25 - 50 Lakhs</option>
                              <option value="5000000-10000000">₹50 Lakhs - 1 Cr</option>
                              <option value="10000000-20000000">₹1 Cr - 2 Cr</option>
                              <option value="20000000">Above ₹2 Cr</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Furnishing
                        </label>
                        <select
                          value={filters.furnishing}
                          onChange={(e) => setFilters(prev => ({ ...prev, furnishing: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="all">Any Furnishing</option>
                          <option value="None">Unfurnished</option>
                          <option value="Semi">Semi Furnished</option>
                          <option value="Full">Fully Furnished</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Availability
                        </label>
                        <select
                          value={filters.availability}
                          onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        >
                          <option value="all">Any Time</option>
                          <option value="Immediate">Ready to Move</option>
                          <option value="Within 15 Days">Within 15 Days</option>
                          <option value="Within 30 Days">Within 30 Days</option>
                          <option value="After 30 Days">After 30 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid - White */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Properties Grid */}
          <div className="mt-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProperties.map(property => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            ) : (
              <div className="h-[calc(100vh-200px)]">
                <PropertiesMap properties={sortedProperties} />
              </div>
            )}

            {sortedProperties.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Properties; 