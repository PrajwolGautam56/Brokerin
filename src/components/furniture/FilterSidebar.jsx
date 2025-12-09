import React, { useState } from 'react';

function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const handlePriceChange = (type, value) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
    
    onFilterChange({
      minPrice: newPriceRange.min,
      maxPrice: newPriceRange.max
    });
  };

  const categories = ['Furniture', 'Appliance', 'Electronic', 'Decoration', 'Kitchenware'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const listingTypes = ['Rent', 'Sell', 'Rent & Sell'];

  const hasActiveFilters = filters.category || filters.condition || filters.status || filters.minPrice || filters.maxPrice || filters.listingType || filters.sortBy;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={(e) => onFilterChange({ category: e.target.checked ? cat : '' })}
                className="mr-2 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span className={`text-sm ${filters.category === cat ? 'text-violet-600 font-medium' : 'text-gray-700'} group-hover:text-violet-600`}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Listing Type */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Listing Type</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="listingType"
              checked={!filters.listingType || filters.listingType === ''}
              onChange={() => onFilterChange({ listingType: '' })}
              className="mr-2 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm group-hover:text-violet-600">All Types</span>
          </label>
          {listingTypes.map(type => (
            <label key={type} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="listingType"
                checked={filters.listingType === type}
                onChange={() => onFilterChange({ listingType: type })}
                className="mr-2 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm group-hover:text-violet-600">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Condition</h4>
        <div className="space-y-2">
          {conditions.map(cond => (
            <label key={cond} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.condition === cond}
                onChange={(e) => onFilterChange({ condition: e.target.checked ? cond : '' })}
                className="mr-2 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span className={`text-sm ${filters.condition === cond ? 'text-violet-600 font-medium' : 'text-gray-700'} group-hover:text-violet-600`}>{cond}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Availability</h4>
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.status === 'Available'}
              onChange={(e) => onFilterChange({ status: e.target.checked ? 'Available' : '' })}
              className="mr-2 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
            />
            <span className={`text-sm ${filters.status === 'Available' ? 'text-violet-600 font-medium' : 'text-gray-700'} group-hover:text-violet-600`}>In Stock Only</span>
          </label>
      </div>

      {/* Sorting */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Sort By</h4>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="">Default</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}

export default FilterSidebar;

