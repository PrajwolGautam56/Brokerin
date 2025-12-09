import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

function ServiceCard({ service, onSelect }) {
  const formatPrice = (pricing) => {
    switch (pricing.type) {
      case 'fixed':
        return `₹${pricing.amount} ${pricing.unit || ''}`;
      case 'range':
        return `₹${pricing.minAmount} - ₹${pricing.maxAmount} ${pricing.unit || ''}`;
      case 'estimate':
        return 'Get Estimate';
      default:
        return '';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Service Image */}
      {service.images && service.images[0] && (
        <div className="aspect-video relative">
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          {!service.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Currently Unavailable</span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Service Info */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {service.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {service.description}
          </p>
        </div>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-2">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-brand-violet rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            <span className="text-sm text-gray-500">Starting from</span>
            <p className="text-lg font-semibold text-brand-violet">
              {formatPrice(service.pricing)}
            </p>
          </div>

          <button
            onClick={() => onSelect(service)}
            disabled={!service.isAvailable}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${service.isAvailable 
                ? 'bg-brand-violet text-white hover:bg-brand-violet/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span>{service.estimateRequired ? 'Get Estimate' : 'Book Now'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceCard; 