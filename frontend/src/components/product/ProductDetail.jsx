import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { productsApi } from '../../services/api';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import PlaceholderImage from '../ui/PlaceholderImage';

export default function ProductDetail({ product, isLoading, error }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div className="mb-8 lg:mb-0">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

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

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
      {/* Product image */}
      <div className="mb-8 lg:mb-0">
        <div className="overflow-hidden rounded-lg">
          <div className="relative h-96 w-full">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <PlaceholderImage name={product.name} />
            )}
          </div>
        </div>
      </div>

      {/* Product info */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        
        {/* Price */}
        <div className="mt-2">
          <p className="text-3xl text-gray-900">${Number(product.price).toFixed(2)}</p>
        </div>

        {/* Rating */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
            <p className="ml-2 text-sm text-gray-500">
              ({product.reviews.length} reviews)
            </p>
          </div>
        )}

        {/* Stock status */}
        <div className="mt-4">
          {product.stock > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              In Stock ({product.stock} available)
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Description</h3>
          <p className="mt-2 text-base text-gray-700">{product.description}</p>
        </div>

        {/* Add to cart */}
        {product.stock > 0 && (
          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center border-x py-1"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}

        {/* Reviews section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
            <div className="mt-6 space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <p className="ml-2 text-sm text-gray-500">
                        by {review.user.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 