import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';

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
              ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
              : `₹${property.price?.sell_price?.toLocaleString()}`,
            status: property.status || 'Status not available',
            imageUrl: property.photos?.length > 0 
              ? propertyService.getImageUrl(property.photos[0])
              : null
          }));
        setPreviewProperties(validProperties);
      }
    } catch (error) {
      console.error('Error fetching preview properties:', error);
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
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Left Side */}
          <div className="lg:w-1/2">
            
            <p className="text-gray-600 mb-4 mt-6 text-lg">
              A great platform to buy or  rent properties easily.
            </p>
            <h1 className="text-4xl font-bold mb-8">
              Trust In.           Broker In.
            </h1>
            
            {/* Stats */}
            <div className="flex gap-16 mb-12">
              <div>
                <h3 className="text-4xl font-bold text-violet-500">500+</h3>
                <p className="text-gray-500 mt-1">Customers</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-violet-500">1K+</h3>
                <p className="text-gray-500 mt-1">Properties</p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex justify-center gap-12 mb-8">
                <button 
                  onClick={() => {
                    setFormType('rent');
                    setSearchParams(prev => ({ ...prev, type: 'rent' }));
                  }}
                  className={`pb-2 px-4 ${formType === 'rent' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'}`}
                >
                  Rent
                </button>
                <button 
                  onClick={() => {
                    setFormType('buy');
                    setSearchParams(prev => ({ ...prev, type: 'buy' }));
                  }}
                  className={`pb-2 px-4 ${formType === 'buy' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'}`}
                >
                  Buy
                </button>
              </div>

              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Location */}
                  <div className="col-span-2">
                    <label className="block text-gray-600 mb-2">Location</label>
                    <input 
                      type="text" 
                      placeholder="Enter location"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-gray-600 mb-2">Property Type</label>
                    <select 
                      value={searchParams.propertyType}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Select Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">Independent House</option>
                      <option value="villa">Villa</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="plot">Plot</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button 
                  type="submit"
                  className="w-full bg-violet-500 text-white py-3.5 rounded-xl hover:bg-violet-600 transition-colors font-medium"
                >
                  Search Properties
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Property Preview Cards */}
          <div className="lg:w-1/2 space-y-6 lg:mt-1">
            {previewProperties.length > 0 ? (
              previewProperties.map(property => (
                <Link 
                  key={property.id} 
                  to={`/property/${property.id}`}
                  className="block transition-transform hover:-translate-y-1 duration-200"
                >
                  <PropertyPreviewCard property={property} />
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No properties available for preview
              </div>
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="flex p-5">
        <div className="w-44 h-36 bg-gray-200 rounded-lg overflow-hidden">
          {property.imageUrl && !imageLoadFailed ? (
            <img 
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={() => setImageLoadFailed(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No image available</span>
            </div>
          )}
        </div>
        <div className="ml-5 flex-1">
          <h3 className="font-medium text-gray-900 mb-3 text-lg">{property.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{property.bedrooms} bedroom</span>
            <span>{property.bathrooms} bath</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{property.location}</p>
          <div className="flex justify-between items-center">
            <span className="bg-violet-100 text-violet-600 px-4 py-1.5 rounded-full text-sm">
              {property.status}
            </span>
            <div className="text-right">
              <span className="text-sm text-gray-500">from</span>
              <p className="font-semibold text-lg">{property.price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero; 