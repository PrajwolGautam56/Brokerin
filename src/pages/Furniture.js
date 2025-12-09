import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { Tab } from '@headlessui/react';
import { furnitureService } from '../services/furnitureService';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { formatPrice, formatPriceWithSuffix } from '../utils/priceFormatter';
import { useFurnitureCart } from '../context/FurnitureCartContext';
import FurnitureCartDrawer from '../components/furniture/FurnitureCartDrawer';
import WishlistButton from '../components/wishlist/WishlistButton';
import FilterSidebar from '../components/furniture/FilterSidebar';

function Furniture() {
  const [selectedTab, setSelectedTab] = useState('rent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    listingType: '',
    condition: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    page: 1,
    limit: 100
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { totalItems } = useFurnitureCart();
  const navigate = useNavigate();

  const handleCartProceed = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      listingType: '',
      condition: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      page: 1,
      limit: 100
    });
  };

  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef('');

  const fetchFurniture = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Create request signature to prevent duplicate calls
    const requestKey = `${selectedTab}-${filters.category}-${filters.condition}-${filters.status}-${filters.minPrice}-${filters.maxPrice}-${filters.sortBy}-${filters.page}`;
    if (lastRequestRef.current === requestKey) {
      logger.log('Skipping duplicate request:', requestKey);
      return;
    }
    lastRequestRef.current = requestKey;
    
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const queryParams = {
        page: filters.page,
        limit: filters.limit
      };
      
      // Add filters if selected
      if (filters.category) {
        queryParams.category = filters.category;
      }
      if (filters.condition) {
        queryParams.condition = filters.condition;
      }
      if (filters.status) {
        queryParams.status = filters.status;
      }
      if (filters.minPrice) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        queryParams.maxPrice = filters.maxPrice;
      }
      if (filters.sortBy) {
        queryParams.sort = filters.sortBy;
      }
      
      // Don't send listingType to backend for tab-based filtering
      // We'll filter client-side to ensure "Rent & Sell" items appear in both tabs
      
      logger.log('Fetching furniture with filters:', queryParams);
      logger.log('Current tab:', selectedTab);
      const data = await furnitureService.getAllFurniture(queryParams);
      logger.log('Furniture response:', data);
      
      // Handle different response formats
      let furnitureData = [];
      if (data.furniture && Array.isArray(data.furniture)) {
        furnitureData = data.furniture;
      } else if (data.data && Array.isArray(data.data)) {
        furnitureData = data.data;
      } else if (Array.isArray(data)) {
        furnitureData = data;
      }
      
      // Parse features for each furniture item to handle stringified JSON or arrays
      furnitureData = furnitureData.map(item => {
        if (item.features) {
          if (Array.isArray(item.features)) {
            // Already an array - extract clean string values
            item.features = item.features.map(f => {
              // If feature is a string that looks like JSON, parse it
              if (typeof f === 'string') {
                try {
                  const parsed = JSON.parse(f);
                  // If parsed is an array, get the first element
                  if (Array.isArray(parsed)) {
                    return parsed[0] || f;
                  }
                  return parsed;
                } catch {
                  return f;
                }
              }
              return String(f);
            }).filter(f => f); // Remove empty values
          } else if (typeof item.features === 'string') {
            try {
              const parsed = JSON.parse(item.features);
              if (Array.isArray(parsed)) {
                // Extract clean string values from array
                item.features = parsed.map(f => {
                  if (typeof f === 'string') {
                    try {
                      const nested = JSON.parse(f);
                      return Array.isArray(nested) ? nested[0] : nested;
                    } catch {
                      return f;
                    }
                  }
                  return String(f);
                }).filter(f => f);
              } else {
                item.features = [String(parsed)];
              }
            } catch (e) {
              // If parsing fails, try to split by comma if it's a plain string
              if (item.features.includes(',')) {
                item.features = item.features.split(',').map(f => f.trim()).filter(f => f);
              } else {
                item.features = [item.features];
              }
            }
          }
        }
        return item;
      });
      
      logger.log('Filtered furniture from API:', furnitureData);
      logger.log('Item count before filtering:', furnitureData.length);
      
      // Filter by listingType and ensure price exists
      if (selectedTab === 'rent') {
        furnitureData = furnitureData.filter(item => {
          const listingType = item.listingType || item.listing_type;
          const isRent = listingType === 'Rent';
          const isRentAndSell = listingType === 'Rent & Sell';
          const hasRentPrice = !!item.price?.rent_monthly;
          
          // Show if: (Rent type with rent price) OR (Rent & Sell type - show in both tabs regardless of which price exists)
          const shouldShow = (isRent && hasRentPrice) || isRentAndSell;
          
          logger.log(`Item: ${item.name}, listingType: ${listingType}, isRent: ${isRent}, isRentAndSell: ${isRentAndSell}, hasRentPrice: ${hasRentPrice}, shouldShow: ${shouldShow}`);
          return shouldShow;
        });
      } else if (selectedTab === 'buy') {
        furnitureData = furnitureData.filter(item => {
          const listingType = item.listingType || item.listing_type;
          const isSell = listingType === 'Sell';
          const isRentAndSell = listingType === 'Rent & Sell';
          const hasSellPrice = !!item.price?.sell_price;
          
          // Show if: (Sell type with sell price) OR (Rent & Sell type - show in both tabs regardless of which price exists)
          const shouldShow = (isSell && hasSellPrice) || isRentAndSell;
          
          return shouldShow;
        });
      }
      
      logger.log('After filtering by listingType:', furnitureData);
      logger.log('Item count after filtering:', furnitureData.length);
      
      // Client-side filtering for listingType (if specified in filters)
      // Note: This is in addition to tab-based filtering, so it further narrows down results
      if (filters.listingType && filters.listingType !== '') {
        furnitureData = furnitureData.filter(item => {
          const listingType = item.listingType || item.listing_type;
          // If filter is "Rent & Sell", show items that are Rent & Sell
          // Otherwise, show items that match the filter OR are Rent & Sell (since they appear in both)
          if (filters.listingType === 'Rent & Sell') {
            return listingType === 'Rent & Sell';
          }
          return listingType === filters.listingType || listingType === 'Rent & Sell';
        });
      }
      
      
      // Client-side filtering for price range (if backend doesn't support it)
      if (filters.minPrice || filters.maxPrice) {
        furnitureData = furnitureData.filter(item => {
          const price = selectedTab === 'rent' 
            ? item.price?.rent_monthly 
            : item.price?.sell_price;
          
          if (!price) return false;
          
          const itemPrice = Number(price);
          const minPrice = filters.minPrice ? Number(filters.minPrice) : 0;
          const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
          
          return itemPrice >= minPrice && itemPrice <= maxPrice;
        });
      }
      
      // Client-side sorting
      if (filters.sortBy) {
        furnitureData = [...furnitureData].sort((a, b) => {
          const priceA = selectedTab === 'rent' 
            ? (a.price?.rent_monthly || 0) 
            : (a.price?.sell_price || 0);
          const priceB = selectedTab === 'rent' 
            ? (b.price?.rent_monthly || 0) 
            : (b.price?.sell_price || 0);
          
          switch (filters.sortBy) {
            case 'price_low':
              return priceA - priceB;
            case 'price_high':
              return priceB - priceA;
            case 'newest':
              const dateA = new Date(a.createdAt || a.created_at || 0);
              const dateB = new Date(b.createdAt || b.created_at || 0);
              return dateB - dateA;
            case 'rating':
              const ratingA = a.rating || a.averageRating || 0;
              const ratingB = b.rating || b.averageRating || 0;
              return ratingB - ratingA;
            default:
              return 0;
          }
        });
      }
      
      logger.log('After client-side filtering and sorting:', furnitureData);
      logger.log('Final item count:', furnitureData.length);
      
      setFurnitureItems(furnitureData);
      
      // Clear error if we have items, set error only if no items and not loading
      if (furnitureData.length === 0 && !loading) {
        const hasActiveFilters = filters.category || filters.condition || filters.status || filters.minPrice || filters.maxPrice || filters.listingType;
        if (hasActiveFilters) {
          setError('No furniture items found matching your filters. Try adjusting your search criteria.');
        } else {
          setError('No furniture items found. Please check back later.');
        }
      } else if (furnitureData.length > 0) {
        setError(null);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        logger.log('Request aborted');
        return;
      }
      logger.error('Error fetching furniture:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load furniture items.');
      setFurnitureItems([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [selectedTab, filters]);

  useEffect(() => {
    fetchFurniture();
    return () => {
      // Cleanup: abort request on unmount or dependency change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchFurniture]);


  return (
    <div className="min-h-screen bg-gray-50">
      <FurnitureCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onProceed={handleCartProceed} />

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Cart Button & View Toggle */}
            <div className="flex items-center gap-3">
              {totalItems > 0 && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-all text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                  </svg>
                  Cart ({totalItems})
                </button>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Filter Toggle (Mobile) */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm hover:shadow transition-all"
          >
            <span className="font-semibold text-gray-900">Filters</span>
            <svg className={`w-5 h-5 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFilters && (
            <div className="mt-4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </div>

        <Tab.Group selectedIndex={selectedTab === 'rent' ? 1 : 0} onChange={(index) => {
          logger.log('Tab changed to index:', index);
          const newTab = index === 1 ? 'rent' : 'buy';
          logger.log('Setting selectedTab to:', newTab);
          setSelectedTab(newTab);
        }}>
          {/* Tabs and Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <Tab.List className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200 max-w-xs">
              <Tab
                className={({ selected }) =>
                  `flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-all duration-200 ${
                    selected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Buy
              </Tab>
              <Tab
                className={({ selected }) =>
                  `flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-all duration-200 ${
                    selected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Rent
              </Tab>
            </Tab.List>
            
            {/* Results Count */}
            {!loading && (
              <div className="text-sm text-gray-600">
                {(() => {
                  const count = searchQuery && searchQuery.trim() !== '' 
                    ? furnitureItems.filter(item => {
                        const query = searchQuery.toLowerCase().trim();
                        const name = (item.name || '').toLowerCase();
                        const category = (item.category || '').toLowerCase();
                        const brand = (item.brand || '').toLowerCase();
                        return name.includes(query) || category.includes(query) || brand.includes(query);
                      }).length
                    : furnitureItems.length;
                  return `Showing ${count} ${count === 1 ? 'item' : 'items'}`;
                })()}
              </div>
            )}
          </div>

          {/* Desktop Layout with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar (Desktop) */}
            <div className="hidden lg:block">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Furniture Grid/List */}
            <div className="lg:col-span-3">
              <Tab.Panels>
            <Tab.Panel>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : (
                (() => {
                  // Apply search filter
                  let displayedItems = furnitureItems;
                  if (searchQuery && searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase().trim();
                    displayedItems = furnitureItems.filter(item => {
                      const name = (item.name || '').toLowerCase();
                      const category = (item.category || '').toLowerCase();
                      const brand = (item.brand || '').toLowerCase();
                      const description = (item.description || '').toLowerCase();
                      return name.includes(query) || category.includes(query) || brand.includes(query) || description.includes(query);
                    });
                  }
                  
                  return viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {displayedItems.map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="buy"
                        setError={setError}
                        setSuccess={setSuccess}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedItems.map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="buy"
                        setError={setError}
                        setSuccess={setSuccess}
                        viewMode={viewMode}
                      />
                    ))}
                    </div>
                  );
                })()
              )}
            </Tab.Panel>
            <Tab.Panel>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : (
                (() => {
                  // Apply search filter
                  let displayedItems = furnitureItems;
                  if (searchQuery && searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase().trim();
                    displayedItems = furnitureItems.filter(item => {
                      const name = (item.name || '').toLowerCase();
                      const category = (item.category || '').toLowerCase();
                      const brand = (item.brand || '').toLowerCase();
                      const description = (item.description || '').toLowerCase();
                      return name.includes(query) || category.includes(query) || brand.includes(query) || description.includes(query);
                    });
                  }
                  
                  return viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {displayedItems.map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="rent"
                        setError={setError}
                        setSuccess={setSuccess}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedItems.map(item => (
                      <FurnitureCard 
                        key={item.id || item._id} 
                        furniture={item} 
                        mode="rent"
                        setError={setError}
                        setSuccess={setSuccess}
                        viewMode={viewMode}
                      />
                    ))}
                    </div>
                  );
                })()
              )}
            </Tab.Panel>
            </Tab.Panels>
          </div>
        </div>
        </Tab.Group>


        {/* Empty State */}
        {!loading && furnitureItems.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No furniture found</h3>
              <p className="text-gray-600 mb-6">We're adding new items every day. Check back soon!</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FurnitureCard({ furniture, mode, setError, setSuccess, viewMode = 'grid' }) {
  const [showModal, setShowModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const { addItem, items } = useFurnitureCart();

  const handleCardClick = () => {
    navigate(`/furniture/${furniture._id || furniture.id}`, { state: { item: furniture } });
  };

  // Check if furniture is available for cart (in stock)
  const isInStock = () => {
    const stock = furniture.stock ?? furniture.stock_count ?? 0;
    const availability = furniture.availability || furniture.status || 'Available';
    const status = furniture.status || 'Available';
    
    // Available if stock > 0 and availability/status is "Available"
    return stock > 0 && availability === 'Available' && status === 'Available';
  };

  const isAvailable = isInStock();

  // Check if item is already in cart
  const cartItem = items.find(item => 
    (item.id === furniture._id || item.id === furniture.id) && item.mode === mode
  );
  const cartQuantity = cartItem?.quantity || 0;

  // Reset added state after 2 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAddingToCart || addedToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        id: furniture._id || furniture.id,
        name: furniture.name,
        mode,
        image: furniture.photos && furniture.photos.length > 0 ? furniture.photos[0] : furniture.image,
        price: furniture.price,
        quantity: 1,
        category: furniture.category
      });
      // Only show success state if item was successfully added
      // The toast notification from addItem will also show
      setAddedToCart(true);
    } catch (error) {
      logger.error('Error adding to cart:', error);
      // Error is already handled by addItem (toast shown, state reverted)
      // Just reset the button state
      setAddedToCart(false);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-64 h-64 md:h-auto overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer" onClick={handleCardClick}>
            <img 
              src={furniture.photos && furniture.photos.length > 0 ? furniture.photos[0] : furniture.image || 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image'} 
              alt={furniture.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image';
              }}
            />
            {!isAvailable && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Out of Stock
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-violet-600" onClick={handleCardClick}>
                  {furniture.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{furniture.category || furniture.item_type}</p>
                
                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {mode === 'buy' 
                        ? (furniture.price?.sell_price ? formatPrice(furniture.price.sell_price, false) : 'Contact')
                        : (furniture.price?.rent_monthly ? formatPriceWithSuffix(furniture.price.rent_monthly, '/mo', false) : 'Contact')
                      }
                    </span>
                  </div>
                </div>

                {/* Features */}
                {furniture.features && furniture.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {furniture.features.slice(0, 2).map((feature, idx) => {
                      const text = typeof feature === 'string' ? feature : String(feature);
                      const truncated = text.length > 50 ? `${text.substring(0, 47)}...` : text;
                      return (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {truncated}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {isAvailable ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addedToCart}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap flex items-center justify-center gap-2 ${
                        addedToCart
                          ? 'bg-green-600 text-white cursor-default'
                          : isAddingToCart
                          ? 'bg-violet-400 text-white cursor-wait'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Adding...</span>
                        </>
                      ) : addedToCart ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added!</span>
                        </>
                      ) : cartQuantity > 0 ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                          </svg>
                          <span>Add More ({cartQuantity})</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick();
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Request for {mode === 'buy' ? 'Purchase' : 'Rent'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group border border-gray-200"
      >
        <div className="relative h-64 overflow-hidden bg-gray-100 cursor-pointer" onClick={handleCardClick}>
          <img 
            src={furniture.photos && furniture.photos.length > 0 ? furniture.photos[0] : furniture.image || 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image'} 
            alt={furniture.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image';
            }}
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton furnitureId={furniture._id || furniture.id} />
          </div>

          {/* Badges */}
          {!isAvailable && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-violet-600" onClick={handleCardClick}>
            {furniture.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{furniture.category || furniture.item_type}</p>
          
          {/* Price */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                {mode === 'buy' 
                  ? (furniture.price?.sell_price ? formatPrice(furniture.price.sell_price, false) : 'Contact')
                  : (furniture.price?.rent_monthly ? formatPriceWithSuffix(furniture.price.rent_monthly, '/mo', false) : 'Contact')
                }
              </span>
            </div>
          </div>
          
          {/* CTA Button */}
          {isAvailable ? (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart}
              className={`w-full py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-600 text-white cursor-default'
                  : isAddingToCart
                  ? 'bg-violet-400 text-white cursor-wait'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : addedToCart ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Added to Cart!</span>
                </>
              ) : cartQuantity > 0 ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                  </svg>
                  <span>Add More ({cartQuantity} in cart)</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l1 7h12l1-7h2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16h14l-1 5H6l-1-5z" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Request for {mode === 'buy' ? 'Purchase' : 'Rent'}</span>
            </button>
          )}
        </div>
      </motion.div>

      {showModal && (
        <RequestModal 
          furniture={furniture} 
          mode={mode}
          onClose={() => setShowModal(false)}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
    </>
  );
}

function RequestModal({ furniture, mode, onClose, setError, setSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    duration: mode === 'rent' ? '1' : '',
    message: '',
    preferred_date: '',
    preferred_time: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If logged in, prefill from user and lock those fields
    if (isAuthenticated && isAuthenticated() && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Use furniture_id if available (from API), otherwise fall back to id
      const furnitureId = furniture.furniture_id || furniture._id || furniture.id;
      
      logger.log('Submitting furniture request with ID:', furnitureId);
      
      // Validate required fields when user details missing
      const effectivePhone = formData.phone || user?.phoneNumber || user?.phone || '';
      if (!effectivePhone) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      await furnitureService.submitFurnitureRequest({
        furniture_id: furnitureId,
        type: mode,
        // If user is logged in, use account details
        userId: user?.id || user?._id,
        name: formData.name || user?.fullName || user?.name,
        email: formData.email || user?.email,
        phone: effectivePhone,
        address: formData.address,
        duration: formData.duration,
        message: formData.message,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time
      });

      setSuccess(`Your ${mode} request for ${furniture.name} has been submitted successfully! We'll contact you shortly.`);
    onClose();
    } catch (error) {
      logger.error('Error submitting request:', error);
      setError(error.message || `Failed to submit ${mode} request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">{furniture.name}</h3>
          {furniture.description && (
            <p className="text-sm text-gray-600 mb-3">
              {furniture.description.length > 100
                ? `${furniture.description.substring(0, 100)}...`
                : furniture.description}
            </p>
          )}
          <p className="text-violet-600 font-bold text-lg">
            {mode === 'buy' 
              ? (furniture.price?.sell_price ? formatPrice(furniture.price.sell_price) : 'Price on request')
              : (furniture.price?.rent_monthly ? formatPriceWithSuffix(furniture.price.rent_monthly, '/month') : 'Price on request')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={(isAuthenticated && isAuthenticated()) && !!(user?.fullName || user?.name)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={(isAuthenticated && isAuthenticated()) && !!user?.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={(isAuthenticated && isAuthenticated()) && !!(user?.phoneNumber || user?.phone)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Contact Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Enter your complete address"
            />
          </div>

          {mode === 'rent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Duration *
              </label>
              <select 
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Select Duration</option>
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Select time</option>
                <option value="09:00-12:00">Morning (9 AM - 12 PM)</option>
                <option value="12:00-15:00">Afternoon (12 PM - 3 PM)</option>
                <option value="15:00-18:00">Evening (3 PM - 6 PM)</option>
                <option value="18:00-20:00">Night (6 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              placeholder="Any special requirements or questions?"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : `Submit ${mode === 'buy' ? 'Purchase' : 'Rental'} Request`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Furniture; 