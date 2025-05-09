'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { reviewsApi } from '../../services/api';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated, token, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Prepare review data
      const reviewData = {
        productId,
        rating,
        comment
      };

      // Get the token from context or localStorage as fallback
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      
      if (!authToken) {
        setError('Authentication token not found. Please log in again.');
        setTimeout(() => {
          logout(); // Force logout if token is missing
        }, 2000);
        return;
      }

      // Submit the review to the backend
      const response = await reviewsApi.create(reviewData, authToken);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout(); // Force logout on auth errors
        }, 2000);
        return;
      }
      
      if (err.response?.data?.error === 'You have already reviewed this product') {
        setError('You have already reviewed this product.');
      } else {
        setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-md mt-8 text-center">
        <p className="text-gray-600">Please log in to leave a review</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-md mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating stars */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">Rating</p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none p-1"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                {(hoveredRating || rating) >= star ? (
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <StarOutlineIcon className="h-6 w-6 text-yellow-400" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm text-gray-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Share your experience with this product..."
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting || rating === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 