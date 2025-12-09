import { useState } from 'react';
import ServiceCard from './ServiceCard';
import ServiceRequest from './ServiceRequest';

function ServiceList({ services }) {
  const [selectedService, setSelectedService] = useState(null);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'interior', label: 'Interior Design' },
    { id: 'painting', label: 'Painting' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'moving', label: 'Moving' },
    { id: 'ac', label: 'AC Services' }
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredServices = services.filter(service => 
    activeCategory === 'all' || service.category === activeCategory
  );

  return (
    <div className="py-12">
      {/* Category Filter */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4 min-w-max px-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors
                ${activeCategory === category.id
                  ? 'bg-brand-violet text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {!selectedService ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.name}
              service={service}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      ) : (
        <ServiceRequest
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default ServiceList; 