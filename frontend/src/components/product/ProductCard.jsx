'use client';

import { useState, useEffect } from 'react';
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
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  
  .toast-notification {
    animation: fadeInOut 3s ease-in-out forwards;
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
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
  const [showStockError, setShowStockError] = useState(false);
  const [stockErrorMessage, setStockErrorMessage] = useState('');

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

  // Hide error toast after animation completes
  useEffect(() => {
    if (showStockError) {
      const timer = setTimeout(() => {
        setShowStockError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showStockError]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (onShowSignInModal) onShowSignInModal();
      return;
    }
    if (stock <= 0) return;
    try {
      setIsAddingToCart(true);
      
      // Check if quantity exceeds stock before adding to cart
      if (quantity > stock) {
        setStockErrorMessage(`Sorry, only ${stock} units available for ${name}`);
        setShowStockError(true);
        setQuantity(stock); // Set quantity to maximum available
        setIsAddingToCart(false);
        return;
      }
      
      const success = await addItem(product, quantity);
      if (!success) {
        // If addItem returned false, check if there's an error message from cart context
        setStockErrorMessage(`Sorry, only ${stock} units available for ${name}`);
        setShowStockError(true);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setStockErrorMessage(error.message || 'Failed to add item to cart');
      setShowStockError(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Ensure price is a number and format it
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2);

  return (
    <>
      {showStockError && (
        <div className="toast-notification shadow-lg bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Stock Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{stockErrorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 flex flex-col h-full">
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
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
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
            
            <div className="flex justify-between items-center mb-4">
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
          </div>
          
          <div className="mt-auto pt-4">
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
      </div>
    </>
  );
};

export default ProductCard; 