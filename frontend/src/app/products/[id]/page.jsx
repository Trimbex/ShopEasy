'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    // Mock data for product detail
    setTimeout(() => {
      const mockProduct = {
        id,
        name: 'Premium Wireless Headphones',
        price: 99.99,
        description: 'Experience premium sound quality with our noise-cancelling headphones.',
        category: 'Electronics',
        stock: 15,
        imageUrl: '/images/products/headphones.jpg'
      };
      
      setProduct(mockProduct);
      setIsLoading(false);
    }, 500);
    
    // Comment: In a real app, this would fetch from an API
    // const fetchProduct = async () => {
    //   try {
    //     const response = await fetch(`/api/products/${id}`);
    //     const data = await response.json();
    //     setProduct(data);
    //   } catch (error) {
    //     console.error('Error fetching product:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="md:flex">
            <div className="md:w-1/2 h-96 bg-gray-200 rounded-lg"></div>
            <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-400 hover:text-gray-500">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href="/products" className="text-gray-400 hover:text-gray-500">Products</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-500">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product image */}
          <div className="mb-8 lg:mb-0">
            <div className="overflow-hidden rounded-lg">
              <div className="bg-gray-200 h-96 flex items-center justify-center">
                {/* This would normally be a real image */}
                <div className="text-gray-500">
                  {product.name} Image
                </div>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2">
              <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
            </div>

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

            <div className="mt-6">
              <p className="text-base text-gray-700">{product.description}</p>
            </div>

            {/* Add to cart */}
            <div className="mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-600"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock <= 0}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-12 text-center p-2 focus:outline-none"
                    disabled={product.stock <= 0}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-600"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock <= 0 || quantity >= product.stock}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 