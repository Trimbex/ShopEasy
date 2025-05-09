import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const ReviewList = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
        <p className="mt-4 text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  // Function to render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < Math.floor(rating) ? (
          <StarIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-5 w-5 text-yellow-400" />
        )}
      </span>
    ));
  };

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
        <span className="text-sm font-medium text-gray-600">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} 
          {averageRating > 0 && ` • Average rating: ${averageRating.toFixed(1)}/5`}
        </span>
      </div>
      
      <div className="mt-6 space-y-6 divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review.id} className="pt-6 first:pt-0">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{review.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-1 flex items-center">
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                {review.comment && (
                  <div className="mt-3 prose prose-sm max-w-none text-gray-700">
                    <p>{review.comment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 