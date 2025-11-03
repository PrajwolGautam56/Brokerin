import { useState, useEffect, useMemo } from 'react';
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

  // Initialize filters from URL params or location state
  const [filters, setFilters] = useState(() => {
    // Check if we have search params from navigation (e.g., from Hero search)
    const urlType = searchParams.get('type');
    const locationState = location.state?.type || location.state?.searchParams?.type;
    
    return {
      type: urlType || locationState || 'all',
      location: searchParams.get('location') || location.state?.location || location.state?.searchParams?.location || '',
      buildingType: searchParams.get('buildingType') || 'all',
      bhk: searchParams.get('bhk') || 'all',
      priceRange: searchParams.get('priceRange') || 'all',
      furnishing: searchParams.get('furnishing') || 'all',
      availability: searchParams.get('availability') || 'all',
      sortBy: searchParams.get('sortBy') || 'newest'
    };
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  // Debug: Log when filters or properties change
  useEffect(() => {
    console.log('🔔 Filters changed:', filters);
    console.log('📊 Total properties:', properties.length);
    console.log('🎯 Current filter type:', filters.type);
    if (properties.length > 0) {
      const sampleProperty = properties[0];
      console.log('📋 Sample property:', {
        name: sampleProperty.name,
        listing_type: sampleProperty.listing_type,
        price: sampleProperty.price,
        status: sampleProperty.status
      });
    }
  }, [filters, properties]);

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

  // Filter properties based on current filters - using useMemo for performance
  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    console.log('🔍 Filtering properties with filter type:', filters.type);
    console.log('📊 Total properties to filter:', properties.length);

    const filtered = properties.filter(property => {
      // Type filter (Rent/Sell) - Handle case-insensitive matching
      if (filters.type !== 'all') {
        // Get listing_type and normalize it
        const listingType = property.listing_type ? String(property.listing_type).trim() : '';
        const listingTypeLower = listingType.toLowerCase();
        
        console.log(`🔍 Checking property "${property.name || property._id}": listing_type="${listingType}" (normalized: "${listingTypeLower}")`);
        console.log(`   Price object:`, property.price);
        console.log(`   rent_monthly:`, property.price?.rent_monthly);
        console.log(`   sell_price:`, property.price?.sell_price);
        
        if (filters.type === 'buy') {
          // For buy: should be 'Sell' (case-insensitive)
          // Price check is optional - show property even if price is not set
          const isForSell = listingTypeLower === 'sell';
          
          if (!isForSell) {
            console.log(`❌ Property "${property.name || property._id}" filtered out (buy): listing_type="${listingType}", isForSell=${isForSell}`);
            return false;
          }
          console.log(`✅ Property "${property.name || property._id}" passed buy filter`);
        } else if (filters.type === 'rent') {
          // For rent: should be 'Rent' (case-insensitive)
          // Price check is optional - show property even if price is not set
          const isForRent = listingTypeLower === 'rent';
          
          if (!isForRent) {
            console.log(`❌ Property "${property.name || property._id}" filtered out (rent): listing_type="${listingType}", isForRent=${isForRent}`);
            return false;
          }
          console.log(`✅ Property "${property.name || property._id}" passed rent filter`);
        }
      }

    // Location filter
    if (filters.location && filters.location.trim()) {
      const propertyLocation = property.location?.toLowerCase() || '';
      const filterLocation = filters.location.toLowerCase().trim();
      if (!propertyLocation.includes(filterLocation)) {
        return false;
      }
    }

    // Building Type filter
    if (filters.buildingType !== 'all') {
      const propertyBuildingType = property.building_type?.toLowerCase() || '';
      const filterBuildingType = filters.buildingType.toLowerCase();
      if (propertyBuildingType !== filterBuildingType) {
        return false;
      }
    }

    // BHK filter
    if (filters.bhk !== 'all') {
      const filterBhk = parseInt(filters.bhk);
      const propertyBhk = parseInt(property.bhk) || 0;
      if (filterBhk === 5) {
        // 5+ means 5 or more
        if (propertyBhk < 5) return false;
      } else {
        if (propertyBhk !== filterBhk) return false;
      }
    }

    // Furnishing filter
    if (filters.furnishing !== 'all') {
      const propertyFurnishing = property.furnishing?.toLowerCase() || '';
      const filterFurnishing = filters.furnishing.toLowerCase();
      if (propertyFurnishing !== filterFurnishing) {
        return false;
      }
    }

    // Availability filter
    if (filters.availability !== 'all') {
      const propertyAvailability = property.availability?.toLowerCase() || '';
      const filterAvailability = filters.availability.toLowerCase();
      if (propertyAvailability !== filterAvailability) {
        return false;
      }
    }

    // Price Range filter
    if (filters.priceRange !== 'all') {
      const listingType = (property.listing_type || '').toLowerCase();
      // Use rent_monthly for Rent, sell_price for Sell
      const price = listingType === 'rent'
        ? property.price?.rent_monthly 
        : property.price?.sell_price;

      if (!price || price === 0) return false;
      
      const [minStr, maxStr] = filters.priceRange.split('-');
      const min = parseInt(minStr);
      const max = maxStr ? parseInt(maxStr) : null;
      
      if (max) {
        // Range like "10000-25000"
        if (price < min || price > max) return false;
      } else {
        // Range like "100000" (minimum only)
        if (price < min) return false;
      }
    }

      // Status filter - only show available properties (but don't filter if status is missing)
      if (property.status && property.status.toLowerCase() !== 'available') {
        return false;
      }

      return true;
    });

    console.log(`✅ Filtered ${filtered.length} properties out of ${properties.length}`);
    console.log('📋 Filter breakdown:', {
      total: properties.length,
      filtered: filtered.length,
      filterType: filters.type,
      sampleFiltered: filtered.length > 0 ? {
        name: filtered[0].name,
        listing_type: filtered[0].listing_type,
        price: filtered[0].price
      } : null
    });
    return filtered;
  }, [properties, filters.type, filters.location, filters.buildingType, filters.bhk, filters.priceRange, filters.furnishing, filters.availability]);

  // Sort filtered properties - using useMemo for performance
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      case 'price-low':
        const listingTypeA = (a.listing_type || '').toLowerCase();
        const listingTypeB = (b.listing_type || '').toLowerCase();
        const priceA = listingTypeA === 'rent' ? (a.price?.rent_monthly || 0) : (a.price?.sell_price || 0);
        const priceB = listingTypeB === 'rent' ? (b.price?.rent_monthly || 0) : (b.price?.sell_price || 0);
        return priceA - priceB;
      case 'price-high':
        const listingTypeHighA = (a.listing_type || '').toLowerCase();
        const listingTypeHighB = (b.listing_type || '').toLowerCase();
        const priceHighA = listingTypeHighA === 'rent' ? (a.price?.rent_monthly || 0) : (a.price?.sell_price || 0);
        const priceHighB = listingTypeHighB === 'rent' ? (b.price?.rent_monthly || 0) : (b.price?.sell_price || 0);
        return priceHighB - priceHighA;
      default:
        return 0;
    }
    });
    return sorted;
  }, [filteredProperties, filters.sortBy]);

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
      <div className="bg-white pt-32 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Available Properties
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {sortedProperties.length} {sortedProperties.length === 1 ? 'property' : 'properties'} found
              {filters.type !== 'all' && ` (${filters.type === 'rent' ? 'For Rent' : 'For Sale'})`}
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
                <div className="flex justify-center mb-4 gap-8">
                  <button
                    onClick={() => {
                      console.log('🔄 Setting filter to: all');
                      setFilters(prev => {
                        const updated = { ...prev, type: 'all' };
                        console.log('✅ Updated filters:', updated);
                        return updated;
                      });
                    }}
                    className={`pb-3 px-8 font-semibold transition-all duration-300 ${
                      filters.type === 'all' 
                        ? 'text-violet-600 border-b-2 border-violet-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    All Properties
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔄 Setting filter to: rent');
                      setFilters(prev => {
                        const updated = { ...prev, type: 'rent' };
                        console.log('✅ Updated filters:', updated);
                        return updated;
                      });
                    }}
                    className={`pb-3 px-8 font-semibold transition-all duration-300 ${
                      filters.type === 'rent' 
                        ? 'text-violet-600 border-b-2 border-violet-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    For Rent
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔄 Setting filter to: buy');
                      setFilters(prev => {
                        const updated = { ...prev, type: 'buy' };
                        console.log('✅ Updated filters:', updated);
                        return updated;
                      });
                    }}
                    className={`pb-3 px-8 font-semibold transition-all duration-300 ${
                      filters.type === 'buy' 
                        ? 'text-violet-600 border-b-2 border-violet-600' 
                        : 'text-gray-400 hover:text-gray-600'
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
                      {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
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