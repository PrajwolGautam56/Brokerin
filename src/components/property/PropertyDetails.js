import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { MapPinIcon, HomeIcon } from '@heroicons/react/24/outline';
import AmenityIcon from '../common/AmenityIcon';

function PropertyDetails() {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  // This will be replaced with API call
  const property = {
    // Property data matching IProperty interface
  };

  if (!property) {
    return <div className="pt-20 text-center">Property not found</div>;
  }

  const formatPrice = (price) => {
    if (property.listing_type === 'Rent') {
      return `₹${price.rent_monthly?.toLocaleString()}/month`;
    }
    return `₹${price.sell_price?.toLocaleString()}`;
  };

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="relative h-[60vh] rounded-xl overflow-hidden mb-8">
          <img 
            src={property.photos[activeImageIndex]} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {property.photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors
                  ${idx === activeImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                  <div className="flex items-center text-gray-500 mt-2">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{property.address.street}, {property.address.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-brand-violet">
                    {formatPrice(property.price)}
                  </p>
                  {property.listing_type === 'Rent' && property.price.deposit && (
                    <p className="text-gray-600">
                      Deposit: ₹{property.price.deposit.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium">{property.property_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">BHK</span>
                  <p className="font-medium">{property.bhk}</p>
                </div>
                <div>
                  <span className="text-gray-500">Area</span>
                  <p className="font-medium">{property.size} sq.ft</p>
                </div>
                <div>
                  <span className="text-gray-500">Furnishing</span>
                  <p className="font-medium">{property.furnishing}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-brand-violet" />
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Contact Owner</h2>
              <form className="space-y-4">
                {/* Form fields */}
                <button
                  type="submit"
                  className="w-full bg-brand-violet text-white py-3 rounded-lg hover:bg-brand-violet/90"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails; 