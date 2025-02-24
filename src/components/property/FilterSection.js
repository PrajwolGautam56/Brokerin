import { useState } from 'react';
import { LocationMarkerIcon, TrainIcon } from '@heroicons/react/outline';

function FilterSection({ filters, onFilterChange }) {
  const [activeFilters, setActiveFilters] = useState({
    searchType: 'locality',
    lookingFor: 'rent',
    priceRange: [0, filters.priceRange.max],
    builtUpArea: [0, filters.builtUpArea.max]
  });

  const handleFilterClick = (section, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [section]: prev[section] === value ? null : value
    }));
  };

  const handleRangeChange = (section, values) => {
    setActiveFilters(prev => ({
      ...prev,
      [section]: values
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        {/* Looking For */}
        <div>
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            {filters.lookingFor.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.lookingFor === option.id
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600'
                }`}
                onClick={() => handleFilterClick('lookingFor', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Property Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {filters.propertyType.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.propertyType === option.id
                    ? 'bg-gray-100'
                    : 'bg-white border border-gray-200'
                }`}
                onClick={() => handleFilterClick('propertyType', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Type with Input */}
        <div>
          <div className="flex gap-4 mb-2">
            {filters.searchType.options.map(option => (
              <button
                key={option.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeFilters.searchType === option.id
                    ? 'border-2 border-teal-500 text-teal-600'
                    : 'border border-gray-200'
                }`}
                onClick={() => handleFilterClick('searchType', option.id)}
              >
                {option.id === 'locality' ? <LocationMarkerIcon className="w-5 h-5" /> : <TrainIcon className="w-5 h-5" />}
                {option.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={filters.searchType.options.find(opt => opt.id === activeFilters.searchType)?.placeholder}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>

        {/* Range Sliders */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {activeFilters.lookingFor === 'rent' ? 'Rent Range' : 'Price Range'}
          </h3>
          <div className="px-4">
            <input
              type="range"
              min={filters.priceRange.min}
              max={filters.priceRange.max}
              step={filters.priceRange.step}
              value={activeFilters.priceRange[1]}
              onChange={(e) => handleRangeChange('priceRange', [0, parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.priceRange.unit}0</span>
              <span>{filters.priceRange.unit}{filters.priceRange.maxLabel}</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
          <div className="grid grid-cols-2 gap-2">
            {filters.availability.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.availability === option.id
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-gray-50'
                }`}
                onClick={() => handleFilterClick('availability', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Furnishing */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Furnishing</h3>
          <div className="flex gap-2">
            {filters.furnishing.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.furnishing === option.id
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-gray-50'
                }`}
                onClick={() => handleFilterClick('furnishing', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Building Type */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Building Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {filters.buildingType.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.buildingType === option.id
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-gray-50'
                }`}
                onClick={() => handleFilterClick('buildingType', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parking */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Parking</h3>
          <div className="flex gap-2">
            {filters.parking.options.map(option => (
              <button
                key={option.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilters.parking === option.id
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-gray-50'
                }`}
                onClick={() => handleFilterClick('parking', option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600"
          onClick={() => onFilterChange(activeFilters)}
        >
          SEARCH
        </button>
      </div>
    </div>
  );
}

export default FilterSection; 