'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comment: This would fetch the order from an API
    // const fetchOrder = async () => {
    //   try {
    //     const response = await fetch(`/api/orders/${id}`);
    //     const data = await response.json();
    //     setOrder(data);
    //   } catch (error) {
    //     console.error('Error fetching order:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    
    // Mock data for the order
    setTimeout(() => {
      const mockOrder = {
        id,
        orderNumber: '1234-5678-9012',
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        items: [
          {
            id: 'item1',
            name: 'Premium Wireless Headphones',
            price: 99.99,
            quantity: 1,
            imageUrl: '/images/products/headphones.jpg'
          },
          {
            id: 'item2',
            name: 'Smart Fitness Watch',
            price: 129.99,
            quantity: 1,
            imageUrl: '/images/products/watch.jpg'
          }
        ],
        subtotal: 229.98,
        shipping: 0,
        tax: 18.40,
        total: 248.38,
        shippingAddress: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'United States'
        },
        paymentMethod: {
          type: 'Credit Card',
          last4: '4242'
        }
      };
      
      setOrder(mockOrder);
      setIsLoading(false);
    }, 1000);
    
    // fetchOrder();
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

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Order not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            We couldn't find an order with the ID you provided.
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

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
          <div className="text-center border-b border-gray-200 pb-8">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
            <p className="mt-2 text-lg text-gray-600">
              Your order #{order.orderNumber} has been placed successfully.
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
                  <dd className="text-gray-900">{order.orderNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Status:</dt>
                  <dd>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                  <dd className="text-gray-900">{order.paymentMethod.type} (**** {order.paymentMethod.last4})</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              
              <address className="not-italic text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="mt-2">{order.shippingAddress.country}</p>
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
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
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
                  <dd className="text-gray-900">${order.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Shipping</dt>
                  <dd className="text-gray-900">
                    {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Tax</dt>
                  <dd className="text-gray-900">${order.tax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <dt className="font-medium text-gray-900">Total</dt>
                  <dd className="font-bold text-indigo-600">${order.total.toFixed(2)}</dd>
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
              <Link href="/account/orders" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 