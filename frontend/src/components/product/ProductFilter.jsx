'use client';

import { useState } from 'react';

const ProductFilter = ({ 
  categories, 
  priceRange, 
  selectedCategories = [], 
  selectedPriceRange = [0, 1000],
  onCategoryChange,
  onPriceRangeChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b lg:hidden">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)} 
          className="flex w-full justify-between items-center"
        >
          <span className="text-lg font-medium">Filters</span>
          <svg 
            className={`h-5 w-5 transform ${isFilterOpen ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block p-4`}>
        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
          <div className="space-y-2">
            {categories?.map(category => (
              <div key={category} className="flex items-center">
                <input
                  id={`category-${category}`}
                  name={`category-${category}`}
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => {
                    if (selectedCategories.includes(category)) {
                      onCategoryChange(selectedCategories.filter(c => c !== category));
                    } else {
                      onCategoryChange([...selectedCategories, category]);
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">${selectedPriceRange[0]}</span>
              <span className="text-sm text-gray-500">${selectedPriceRange[1]}</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selectedPriceRange[0]}
                onChange={(e) => onPriceRangeChange([parseInt(e.target.value), selectedPriceRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selectedPriceRange[1]}
                onChange={(e) => onPriceRangeChange([selectedPriceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            onCategoryChange([]);
            onPriceRangeChange([priceRange[0], priceRange[1]]);
          }}
          className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter; 