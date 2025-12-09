import { Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { useState } from 'react';

function PropertyCard({ property }) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  if (!property) {
    return null;
  }

  const amenities = property.amenities?.length > 0 
    ? propertyService.formatAmenities(property.amenities[0]) 
    : [];
    
  const imageUrl = property.photos?.length > 0 && !imageLoadFailed
    ? propertyService.getImageUrl(property.photos[0])
    : null;

  const propertyName = property.name ? property.name.replace(/"/g, '') : 'Property Name Not Available';

  return (
    <Link 
      to={`/property/${property._id}`}
      className="block card-modern group"
    >
      {/* Property Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={propertyName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageLoadFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-sm">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
            property.status === 'Available' 
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {property.status || 'Status Not Available'}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">
              {propertyName}
            </h3>
            <p className="text-gray-500 flex items-center gap-1 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.location || 'Location Not Available'}
            </p>
          </div>
          <div className="ml-4">
            <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-3 py-1 rounded-lg text-xs font-bold">
              {property.listing_type || 'Type Not Available'}
            </span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{property.bhk || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">BHK</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{property.bathrooms || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">Baths</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{property.size || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">sq.ft</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {amenities.length > 0 ? (
              <>
                {amenities.slice(0, 3).map((amenity, index) => (
                  <span 
                    key={index}
                    className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-violet-100"
                  >
                    {amenity.trim()}
                  </span>
                ))}
                {amenities.length > 3 && (
                  <span className="text-gray-500 text-xs">+{amenities.length - 3} more</span>
                )}
              </>
            ) : (
              <span className="text-gray-500 text-xs">No amenities listed</span>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
          <div className="text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">{property.furnishing || 'Not Specified'} Furnished</span>
          </div>
          <div className="text-violet-600 font-bold bg-violet-50 px-3 py-1 rounded-lg">
            {property.availability || 'Availability Not Specified'}
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <span className="text-xs text-gray-500 block mb-1">Starting from</span>
            <span className="text-2xl font-extrabold gradient-text">
              {property.listing_type === 'Rent'
                ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
                : `₹${property.price?.sell_price?.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard; 