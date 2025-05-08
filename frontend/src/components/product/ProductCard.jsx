'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SignInModal from '../auth/SignInModal';

const ProductCard = ({ product }) => {
  const { id, name, price, description, imageUrl, stock } = product;
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
      return;
    }
    if (stock <= 0) return;
    
    try {
      setIsAddingToCart(true);
      addItem(product, quantity);
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
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer active:bg-indigo-800 ${
            stock <= 0 || isAddingToCart ? 'cursor-not-allowed' : ''
          }`}
          disabled={stock <= 0 || isAddingToCart}
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />
    </div>
  );
};

export default ProductCard; 