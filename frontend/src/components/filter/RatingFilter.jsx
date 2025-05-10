'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const RatingFilter = ({ onFilterChange }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  
  const handleRatingSelect = (rating) => {
    // Toggle same rating to clear filter
    const newRating = rating === selectedRating ? 0 : rating;
    setSelectedRating(newRating);
    onFilterChange(newRating);
  };

  // Function to render star rating
  const renderStars = (maxRating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < maxRating ? (
          <StarIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-5 w-5 text-yellow-400" />
        )}
      </span>
    ));
  };

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Filter by Rating</h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingSelect(rating)}
            className={`flex items-center w-full py-2 px-3 rounded-md ${
              selectedRating === rating ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              {renderStars(rating)}
              <span className="ml-2 text-sm text-gray-700">& Up</span>
            </div>
          </button>
        ))}
        {selectedRating > 0 && (
          <button
            onClick={() => handleRatingSelect(0)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingFilter; 