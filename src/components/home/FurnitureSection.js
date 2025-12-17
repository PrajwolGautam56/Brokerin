import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { Link, useNavigate } from 'react-router-dom';
import { furnitureService } from '../../services/furnitureService';
import { ArrowRightIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { formatPrice, formatPriceWithSuffix } from '../../utils/priceFormatter';
import { useFurnitureCart } from '../../context/FurnitureCartContext';

// Furniture Card Component
function FurnitureCard({ item }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useFurnitureCart();
  const navigate = useNavigate();
  
  // Determine mode based on listing_type
  const listingType = item.listing_type || item.listingType;
  const mode = listingType === 'Sell' ? 'buy' : 'rent';
  
  // Check if item is in stock
  const stock = item.stock ?? item.stock_count ?? 0;
  const availability = item.availability || item.status || 'Available';
  const status = item.status || 'Available';
  const isAvailable = stock > 0 && availability === 'Available' && status === 'Available';
  
  // Reset added state after 2 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);
  
  const handleCardClick = () => {
    navigate(`/furniture/${item._id || item.id}`, { state: { item } });
  };
  
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAddingToCart || addedToCart || !isAvailable) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        id: item._id || item.id,
        name: item.name,
        mode,
        image: item.photos && item.photos.length > 0 ? furnitureService.getImageUrl(item.photos[0]) : null,
        price: item.price,
        quantity: 1,
        category: item.category
      });
      setAddedToCart(true);
    } catch (error) {
      logger.error('Error adding to cart:', error);
      setAddedToCart(false);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer relative"
    >
      {/* Image */}
      <div className="relative h-56 md:h-64 bg-gray-200 overflow-hidden">
        {item.photos && item.photos.length > 0 ? (
          <>
            <img
              src={furnitureService.getImageUrl(item.photos[0])}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="18"%3ENo image%3C/text%3E%3C/svg%3E';
              }}
              loading="lazy"
            />
            {/* Image Count Badge */}
            {item.photos.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {item.photos.length}
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
            (item.listing_type || item.listingType) === 'Rent'
              ? 'bg-violet-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {item.listing_type || item.listingType || 'Available'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Title */}
        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {item.name || 'Furniture Item'}
        </h3>

        {/* Price and Add to Cart */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">
                {item.price?.rent_monthly ? 'Starting from' : 'Price'}
              </span>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {item.price?.rent_monthly 
                  ? formatPriceWithSuffix(item.price.rent_monthly, '/mo', false)
                  : item.price?.sell_price
                  ? formatPrice(item.price.sell_price, false)
                  : 'Contact for price'}
              </p>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          {isAvailable ? (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
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
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FurnitureSection() {
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedFurniture();
  }, []);

  const fetchFeaturedFurniture = async () => {
    try {
      const data = await furnitureService.getAllFurniture({ 
        status: 'Available', 
        limit: 6 
      });
      
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
      
      setFurnitureItems(furnitureData.slice(0, 6));
    } catch (error) {
      logger.error('Error fetching furniture:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Header Section */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Rent Premium Furniture
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform your space with premium furniture. Rent for as low as ₹299/month
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Free Installation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">No Security Deposit</span>
            </div>
          </div>
        </div>

        {/* Furniture Grid */}
        {furnitureItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
              {furnitureItems.map((item, index) => (
                <FurnitureCard key={item._id || item.id} item={item} />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                to="/furniture"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 gap-2"
              >
                Explore All Furniture
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Furniture listings coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FurnitureSection;

