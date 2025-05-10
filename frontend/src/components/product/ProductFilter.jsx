'use client';

import { useState, useEffect, useMemo } from 'react';
import RatingFilter from '../filter/RatingFilter';

const ProductFilter = ({ 
  categories, 
  priceRange, 
  selectedCategories = [], 
  selectedPriceRange = [0, 5000],
  onCategoryChange,
  onPriceRangeChange,
  selectedRating = 0,
  onRatingChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [noMinPrice, setNoMinPrice] = useState(false);
  const [noMaxPrice, setNoMaxPrice] = useState(false);
  const [minInputValue, setMinInputValue] = useState(selectedPriceRange[0]);
  const [maxInputValue, setMaxInputValue] = useState(selectedPriceRange[1]);

  // Calculate appropriate step size based on price range
  const stepSize = useMemo(() => {
    const range = priceRange[1] - priceRange[0];
    if (range > 10000) return 100;
    if (range > 1000) return 10;
    if (range > 100) return 5;
    return 1;
  }, [priceRange]);

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle no min price change
  const handleNoMinPriceChange = (e) => {
    const checked = e.target.checked;
    setNoMinPrice(checked);
    if (checked) {
      // Set to minimum possible value when "No minimum" is checked
      onPriceRangeChange([priceRange[0], selectedPriceRange[1]]);
      setMinInputValue(priceRange[0]);
    } else if (selectedPriceRange[0] === priceRange[0]) {
      // When unchecking, set to a reasonable default if currently at minimum
      const defaultMin = Math.floor(priceRange[0] + (priceRange[1] - priceRange[0]) * 0.1);
      onPriceRangeChange([defaultMin, selectedPriceRange[1]]);
      setMinInputValue(defaultMin);
    }
  };

  // Handle no max price change
  const handleNoMaxPriceChange = (e) => {
    const checked = e.target.checked;
    setNoMaxPrice(checked);
    if (checked) {
      // Set to maximum possible value when "No maximum" is checked
      onPriceRangeChange([selectedPriceRange[0], priceRange[1]]);
      setMaxInputValue(priceRange[1]);
    } else if (selectedPriceRange[1] === priceRange[1]) {
      // When unchecking, set to a reasonable default if currently at maximum
      const defaultMax = Math.floor(priceRange[1] - (priceRange[1] - priceRange[0]) * 0.1);
      onPriceRangeChange([selectedPriceRange[0], defaultMax]);
      setMaxInputValue(defaultMax);
    }
  };

  // Handle minimum price input change
  const handleMinInputChange = (e) => {
    const value = e.target.value;
    setMinInputValue(value);
  };

  // Handle maximum price input change
  const handleMaxInputChange = (e) => {
    const value = e.target.value;
    setMaxInputValue(value);
  };

  // Apply the min input value when input is blurred or Enter is pressed
  const applyMinPriceInput = () => {
    // Parse the input value to a number, fall back to 0 if not a number
    let value = parseInt(minInputValue, 10);
    if (isNaN(value) || value < priceRange[0]) {
      value = priceRange[0];
    } else if (value > selectedPriceRange[1]) {
      value = selectedPriceRange[1];
    }

    setMinInputValue(value);
    onPriceRangeChange([value, selectedPriceRange[1]]);
    setNoMinPrice(value === priceRange[0]);
  };

  // Apply the max input value when input is blurred or Enter is pressed
  const applyMaxPriceInput = () => {
    // Parse the input value to a number, fall back to max if not a number
    let value = parseInt(maxInputValue, 10);
    if (isNaN(value) || value > priceRange[1]) {
      value = priceRange[1];
    } else if (value < selectedPriceRange[0]) {
      value = selectedPriceRange[0];
    }

    setMaxInputValue(value);
    onPriceRangeChange([selectedPriceRange[0], value]);
    setNoMaxPrice(value === priceRange[1]);
  };

  // Handle Enter key press for inputs
  const handleKeyDown = (e, applyFn) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFn();
    }
  };

  // Sync checkbox states with selected price range
  useEffect(() => {
    if (selectedPriceRange[0] === priceRange[0] && !noMinPrice) {
      setNoMinPrice(true);
    } else if (selectedPriceRange[0] !== priceRange[0] && noMinPrice) {
      setNoMinPrice(false);
    }
  }, [selectedPriceRange[0], priceRange, noMinPrice]);

  useEffect(() => {
    if (selectedPriceRange[1] === priceRange[1] && !noMaxPrice) {
      setNoMaxPrice(true);
    } else if (selectedPriceRange[1] !== priceRange[1] && noMaxPrice) {
      setNoMaxPrice(false);
    }
  }, [selectedPriceRange[1], priceRange, noMaxPrice]);

  // Update input values when selected price range changes
  useEffect(() => {
    setMinInputValue(selectedPriceRange[0]);
    setMaxInputValue(selectedPriceRange[1]);
  }, [selectedPriceRange]);

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

        {/* Rating Filter */}
        <div className="mb-6 border-t pt-4">
          <RatingFilter onFilterChange={onRatingChange} />
        </div>

        {/* Price Range */}
        <div className="mb-6 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                {noMinPrice ? 'No minimum' : formatPrice(selectedPriceRange[0])}
              </span>
              <span className="text-sm text-gray-500">
                {noMaxPrice ? 'No maximum' : formatPrice(selectedPriceRange[1])}
              </span>
            </div>
            <div className="flex space-x-2">
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                step={stepSize}
                value={selectedPriceRange[0]}
                disabled={noMinPrice}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  onPriceRangeChange([value, selectedPriceRange[1]]);
                  setMinInputValue(value);
                }}
                className={`w-full ${noMinPrice ? 'opacity-50' : ''}`}
              />
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                step={stepSize}
                value={selectedPriceRange[1]}
                disabled={noMaxPrice}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  onPriceRangeChange([selectedPriceRange[0], value]);
                  setMaxInputValue(value);
                }}
                className={`w-full ${noMaxPrice ? 'opacity-50' : ''}`}
              />
            </div>
            
            {/* Exact price inputs */}
            <div className="flex justify-between items-center space-x-4">
              <div className="w-1/2">
                <label htmlFor="min-price-input" className="block text-sm text-gray-500 mb-1">Min Price</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                  <input
                    id="min-price-input"
                    type="number"
                    min={priceRange[0]}
                    max={selectedPriceRange[1]}
                    value={minInputValue}
                    onChange={handleMinInputChange}
                    onBlur={applyMinPriceInput}
                    onKeyDown={(e) => handleKeyDown(e, applyMinPriceInput)}
                    disabled={noMinPrice}
                    className={`w-full pl-6 pr-2 py-1 text-sm border rounded-md ${noMinPrice ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                    placeholder="Min"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label htmlFor="max-price-input" className="block text-sm text-gray-500 mb-1">Max Price</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                  <input
                    id="max-price-input"
                    type="number"
                    min={selectedPriceRange[0]}
                    max={priceRange[1]}
                    value={maxInputValue}
                    onChange={handleMaxInputChange}
                    onBlur={applyMaxPriceInput}
                    onKeyDown={(e) => handleKeyDown(e, applyMaxPriceInput)}
                    disabled={noMaxPrice}
                    className={`w-full pl-6 pr-2 py-1 text-sm border rounded-md ${noMaxPrice ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            
            {/* No Min/Max Options */}
            <div className="flex justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="no-min-price"
                  name="no-min-price"
                  type="checkbox"
                  checked={noMinPrice}
                  onChange={handleNoMinPriceChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="no-min-price" className="ml-2 text-sm text-gray-700">
                  No minimum
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="no-max-price"
                  name="no-max-price"
                  type="checkbox"
                  checked={noMaxPrice}
                  onChange={handleNoMaxPriceChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="no-max-price" className="ml-2 text-sm text-gray-700">
                  No maximum
                </label>
              </div>
            </div>

            {/* Show price range info */}
            <div className="text-xs text-gray-500 mt-1">
              Price range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            onCategoryChange([]);
            onPriceRangeChange([priceRange[0], priceRange[1]]);
            onRatingChange(0);
            setNoMinPrice(false);
            setNoMaxPrice(false);
            setMinInputValue(priceRange[0]);
            setMaxInputValue(priceRange[1]);
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