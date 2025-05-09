'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const styles = `
  @keyframes checkmark {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-checkmark {
    animation: checkmark 0.5s ease-in-out forwards;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const ProductCard = ({ product, onShowSignInModal }) => {
  const { id, name, price, description, imageUrl, stock } = product;
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Calculate average rating if product has reviews
  const averageRating = product.averageRating || (product.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0);
  
  // Function to render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < Math.floor(rating) ? (
          <StarIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-4 w-4 text-yellow-400" />
        )}
      </span>
    ));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (onShowSignInModal) onShowSignInModal();
      return;
    }
    if (stock <= 0) return;
    try {
      setIsAddingToCart(true);
      addItem(product, quantity);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Ensure price is a number and format it
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105">
      <div className="relative">
        <Link href={`/products/${id}`}>
          <img 
            src={imageUrl || '/placeholder-product.jpg'} 
            alt={name}
            className="w-full h-48 object-cover"
          />
        </Link>
        {stock <= 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        {stock > 0 && stock < 5 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            Low Stock
          </span>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 mb-1">{name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
        
        {/* Star Rating Display */}
        <div className="flex items-center mb-2">
          <div className="flex">
            {renderStars(averageRating)}
          </div>
          {product.reviews?.length > 0 ? (
            <span className="ml-1 text-xs text-gray-500">
              ({averageRating.toFixed(1)}/5 • {product.reviews.length})
            </span>
          ) : (
            <span className="ml-1 text-xs text-gray-500">
              (No reviews)
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${formattedPrice}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-gray-600 hover:text-gray-900"
            >
              -
            </button>
            <span className="text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-gray-600 hover:text-gray-900"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 relative ${
            stock <= 0 || isAddingToCart ? 'cursor-not-allowed opacity-75' : ''
          }`}
          disabled={stock <= 0 || isAddingToCart}
        >
          <span className={`transition-opacity duration-200 ${isAddingToCart ? 'opacity-0' : 'opacity-100'}`}>
            Add to Cart
          </span>
          {isAddingToCart && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white animate-checkmark" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 