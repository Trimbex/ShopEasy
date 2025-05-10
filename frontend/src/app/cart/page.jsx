'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import api from '@/services/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { 
    cartItems, 
    removeItem, 
    updateQuantity, 
    getCartTotal, 
    getDiscountedTotal,
    isLoading,
    error: cartError,
    appliedCoupon,
    discount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?returnTo=/cart');
    }
  }, [isAuthenticated, router]);

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, parseInt(newQuantity));
    } catch (error) {
      console.log('Quantity update error:', error);
    }
  };
  
  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };
  
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError(null);
    setIsApplyingCoupon(true);

    try {
      // Validate coupon code
      if (!couponCode.trim()) {
        setCouponError('Please enter a coupon code');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setCouponError('Please sign in to apply a coupon');
        return;
      }

      // Validate cart total
      const cartTotal = getCartTotal();
      if (cartTotal <= 0) {
        setCouponError('Your cart must have items to apply a coupon');
        return;
      }

      // Ensure orderTotal is a number
      const orderTotal = Number(cartTotal);
      if (isNaN(orderTotal)) {
        setCouponError('Invalid cart total');
        return;
      }

      const { data } = await api.post('/coupons/apply', {
        alias: couponCode.trim().toUpperCase(),
        orderTotal
      });

      if (!data || !data.discount) {
        throw new Error('Invalid response from server');
      }
      
      // Make sure the couponId is included
      if (!data.couponId) {
        throw new Error('Coupon ID is missing in the API response');
      }

      applyCoupon({
        id: data.couponId,
        alias: data.alias,
        percentDiscount: data.percentDiscount
      }, data.discount);
      
      setCouponCode('');
    } catch (err) {
      console.error('Coupon application error:', err);
      const errorMessage = err.response?.data?.error;
      if (errorMessage) {
        // Map backend error messages to user-friendly messages
        const errorMap = {
          'Coupon not found': 'Invalid coupon code',
          'Coupon is not active': 'This coupon is no longer active',
          'Coupon not yet valid': 'This coupon is not yet valid',
          'Coupon expired': 'This coupon has expired',
          'Order total must be at least': 'Your order total is too low for this coupon',
          'Coupon usage limit reached for this user': 'You have reached the maximum usage limit for this coupon',
          'Coupon usage limit reached': 'This coupon has reached its maximum usage limit',
          'Unauthorized': 'Please sign in to apply a coupon'
        };

        // Find matching error message or use the original
        const friendlyMessage = Object.entries(errorMap).find(([key]) => 
          errorMessage.includes(key)
        )?.[1] || errorMessage;

        setCouponError(friendlyMessage);
      } else {
        setCouponError('Failed to apply coupon. Please try again.');
      }
      removeCoupon();
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Please sign in to view your cart</h2>
          <p className="mt-1 text-sm text-gray-500">
            You need to be signed in to manage your shopping cart.
          </p>
          <div className="mt-6">
            <Link 
              href="/login?returnTo=/cart" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
  const taxEstimate = (subtotal - discount) * 0.08;
  const total = getDiscountedTotal() + shippingEstimate + taxEstimate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      
      {/* Stock error message */}
      {cartError && cartError.includes('Stock Error') && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{cartError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Coupon error message */}
      {couponError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Coupon Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{couponError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="bg-white shadow-sm rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="p-6 flex">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-500">Qty</label>
                        <select
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 lg:col-span-5">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <form onSubmit={handleApplyCoupon} className="mb-6">
              <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon
              </label>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        Coupon Applied: {appliedCoupon.alias}
                      </h3>
                      <div className="mt-1 text-sm text-green-700">
                        <p>{appliedCoupon.percentDiscount}% discount has been applied to your order.</p>
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Remove Coupon
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    id="coupon"
                    name="coupon"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      couponError ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter coupon code"
                    disabled={isApplyingCoupon}
                  />
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
            </form>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-base font-medium text-green-600 mb-4">
                  <p>
                    Discount {appliedCoupon && `(${appliedCoupon.percentDiscount}% off)`}
                    {appliedCoupon && (
                      <span className="ml-2 text-xs text-green-700">Code: {appliedCoupon.alias}</span>
                    )}
                  </p>
                  <p>-${discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Shipping</p>
                <p>{shippingEstimate === 0 ? 'Free' : `$${shippingEstimate.toFixed(2)}`}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Tax</p>
                <p>${taxEstimate.toFixed(2)}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {cartError && cartError.includes('Stock Error') ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-sm text-red-600 text-center">
                    Please adjust item quantities to continue
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 