'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../services/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Set the auth token for this request
        api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching order:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

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

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <span className="text-2xl text-red-600">❌</span>
          </div>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Error Loading Order</h2>
          <p className="mt-1 text-sm text-gray-500">
            {error || "We couldn't find the order you're looking for."}
          </p>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = order.coupon ? (subtotal * order.coupon.percentDiscount) / 100 : 0;
  const shippingCost = Number(order.shippingInfo?.shippingCost) || 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingCost + tax;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
          <div className="text-center border-b border-gray-200 pb-8">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-green-100 rounded-full p-3 h-16 w-16 flex items-center justify-center">
                <span className="text-2xl text-green-600">✓</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
            <p className="mt-2 text-lg text-gray-600">
              Your order #{order.id} has been placed successfully.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
              
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Order number:</dt>
                  <dd className="text-gray-900">{order.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Status:</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Date:</dt>
                  <dd className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Payment method:</dt>
                  <dd className="text-gray-900 flex items-center">
                    {order.paymentInfo?.method === 'vodafoneCash' && (
                      <>
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-800 h-6 w-6 rounded mr-2">
                          <span className="text-xs font-bold">📱</span>
                        </span>
                        <span>Vodafone Cash</span>
                        {order.paymentInfo?.phoneNumber && (
                          <span className="ml-1 text-sm text-gray-500">(**** {order.paymentInfo?.phoneNumber.slice(-4) || '0000'})</span>
                        )}
                      </>
                    )}
                    {order.paymentInfo?.method === 'paypal' && (
                      <>
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 h-6 w-6 rounded mr-2">
                          <span className="text-xs font-bold">@</span>
                        </span>
                        <span>PayPal</span>
                        {order.paymentInfo?.paypalEmail && (
                          <span className="ml-1 text-sm text-gray-500">({order.paymentInfo?.paypalEmail})</span>
                        )}
                      </>
                    )}
                    {order.paymentInfo?.method !== 'paypal' && order.paymentInfo?.method !== 'vodafoneCash' && (
                      <>
                        <span className="inline-flex items-center justify-center bg-orange-100 text-orange-800 h-6 w-6 rounded mr-2">
                          <span className="text-xs font-bold">💳</span>
                        </span>
                        <span>Credit Card</span>
                        {order.paymentInfo?.cardNumber && (
                          <span className="ml-1 text-sm text-gray-500">(**** {order.paymentInfo?.cardNumber?.slice(-4) || '0000'})</span>
                        )}
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              
              <address className="not-italic text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shippingInfo?.name}</p>
                <p>{order.shippingInfo?.address}</p>
                <p>
                  {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.postalCode}
                </p>
                <p className="mt-2">{order.shippingInfo?.country}</p>
              </address>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded overflow-hidden">
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product?.name || 'Product image'}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/placeholder-images@1.0.0/dist/img/placeholder-product.png";
                                }}
                              />
                            ) : (
                              <img
                                src="https://cdn.jsdelivr.net/npm/@tailwindcss/placeholder-images@1.0.0/dist/img/placeholder-product.png"
                                alt="Product placeholder"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Subtotal</dt>
                  <dd className="text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                {order.coupon && (
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-600">
                      Discount ({order.coupon.percentDiscount}% off)
                      <span className="ml-2 text-xs text-green-600">Code: {order.coupon.alias}</span>
                    </dt>
                    <dd className="text-green-600">-${discount.toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Shipping</dt>
                  <dd className="text-gray-900">
                    {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Tax</dt>
                  <dd className="text-gray-900">${tax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <dt className="font-medium text-gray-900">Total</dt>
                  <dd className="font-bold text-indigo-600">
                    {order.coupon ? (
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 line-through text-sm">${(subtotal + shippingCost + tax).toFixed(2)}</span>
                        <span>${(subtotal - discount + shippingCost + tax).toFixed(2)}</span>
                      </div>
                    ) : (
                      `$${(subtotal + shippingCost + tax).toFixed(2)}`
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              We'll send you shipping confirmation when your item(s) are on the way! <br />
              We appreciate your business, and hope you enjoy your purchase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Continue Shopping
              </Link>
              <Link href="/profile?tab=orders" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 