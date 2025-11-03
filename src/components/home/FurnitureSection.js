import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { furnitureService } from '../../services/furnitureService';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

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
      
      setFurnitureItems(furnitureData.slice(0, 6));
    } catch (error) {
      console.error('Error fetching furniture:', error);
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Featured <span className="gradient-text">Furniture</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rent or buy premium furniture to make your house a home
          </p>
        </div>

        {/* Furniture Grid */}
        {furnitureItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {furnitureItems.map((item, index) => (
                <Link
                  key={item._id || item.id}
                  to="/furniture"
                  className="card-modern group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {item.photos && item.photos.length > 0 ? (
                      <img
                        src={furnitureService.getImageUrl(item.photos[0])}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400"><span class="text-sm">No image</span></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                        <span className="text-sm">No image</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {item.listing_type || item.listingType || 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {item.name || 'Furniture Item'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description || item.category || 'Premium furniture item'}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500 block">Starting from</span>
                        <span className="text-xl font-extrabold gradient-text">
                          {item.price?.rent_monthly 
                            ? `₹${item.price.rent_monthly.toLocaleString()}/mo`
                            : item.price?.sell_price
                            ? `₹${item.price.sell_price.toLocaleString()}`
                            : 'Contact for price'}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <ArrowRightIcon className="w-5 h-5 text-violet-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center animate-fade-in">
              <Link
                to="/furniture"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-violet transform hover:scale-105 transition-all duration-300 gap-2"
              >
                Explore All Furniture
                <ArrowRightIcon className="w-5 h-5" />
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

