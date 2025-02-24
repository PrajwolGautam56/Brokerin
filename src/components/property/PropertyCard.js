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
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={propertyName}
            className="w-full h-full object-cover"
            onError={() => setImageLoadFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No image available</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'Available' 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {property.status || 'Status Not Available'}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {propertyName}
            </h3>
            <p className="text-gray-600">{property.location || 'Location Not Available'}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">{property.listing_type || 'Type Not Available'}</span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">{property.bhk || 'N/A'}</span> BHK
          </div>
          <div>
            <span className="font-medium">{property.bathrooms || 'N/A'}</span> Baths
          </div>
          <div>
            <span className="font-medium">{property.size || 'N/A'}</span> sq.ft
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
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
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
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="text-gray-600">
            {property.furnishing || 'Not Specified'} Furnished
          </div>
          <div className="text-violet-600 font-medium">
            {property.availability || 'Availability Not Specified'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard; 