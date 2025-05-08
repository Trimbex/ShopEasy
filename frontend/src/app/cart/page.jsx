'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cartItems, removeItem, updateQuantity, getCartTotal, isLoading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity));
  };
  
  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };
  
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Comment: This would normally validate with an API
    if (couponCode === 'WELCOME20') {
      setDiscount(getCartTotal() * 0.2);
    } else {
      alert('Invalid coupon code');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven't added any products to your cart yet.
          </p>
          <div className="mt-6">
            <Link 
              href="/products" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingEstimate = subtotal > 50 ? 0 : 5.99;
  const taxEstimate = subtotal * 0.08;
  const total = subtotal + shippingEstimate + taxEstimate - discount;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white shadow-sm rounded-lg mb-6">
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>
                            <Link href={`/products/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-500">Qty</span>
                          <select
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="border border-gray-300 rounded-md py-1"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="font-medium text-red-600 hover:text-red-500 cursor-pointer transition-colors duration-200 active:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between">
              <Link href="/products" className="text-indigo-600 hover:text-indigo-500">
                ← Continue Shopping
              </Link>
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                    clearCart();
                  }
                }}
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <form onSubmit={handleApplyCoupon} className="mb-6">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="coupon"
                    name="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="mt-1 text-sm text-green-600">
                    Coupon applied: 20% discount
                  </p>
                )}
              </form>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-gray-600">Shipping estimate</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {shippingEstimate === 0 ? 'Free' : `$${shippingEstimate.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-gray-600">Tax estimate</dt>
                  <dd className="text-sm font-medium text-gray-900">${taxEstimate.toFixed(2)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-2">
                    <dt className="text-sm text-gray-600">Discount</dt>
                    <dd className="text-sm font-medium text-green-600">-${discount.toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between py-4 border-t border-gray-200">
                  <dt className="text-base font-medium text-gray-900">Order total</dt>
                  <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/checkout"
                  className="block w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white text-center hover:bg-indigo-700"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 