'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login?returnTo=/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data and orders
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      // Comment: This would fetch the user's orders from an API
      // const fetchOrders = async () => {
      //   try {
      //     const response = await fetch('/api/orders');
      //     const data = await response.json();
      //     setOrders(data);
      //   } catch (error) {
      //     console.error('Error fetching orders:', error);
      //   }
      // };
      
      // Mock order data
      const mockOrders = [
        {
          id: 'order1',
          orderNumber: '1234-5678-9012',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DELIVERED',
          total: 248.38,
          items: [
            { name: 'Premium Wireless Headphones', quantity: 1 },
            { name: 'Smart Fitness Watch', quantity: 1 }
          ]
        },
        {
          id: 'order2',
          orderNumber: '2345-6789-0123',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DELIVERED',
          total: 134.97,
          items: [
            { name: 'Portable Bluetooth Speaker', quantity: 1 },
            { name: 'Leather Wallet', quantity: 1 },
            { name: 'Organic Face Cream', quantity: 1 }
          ]
        }
      ];
      
      setOrders(mockOrders);
      setIsLoading(false);
      
      // fetchOrders();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Comment: This would update the user's profile via an API
    // try {
    //   const response = await fetch('/api/user/profile', {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(profileForm),
    //   });
    //   
    //   if (response.ok) {
    //     setUpdateSuccess(true);
    //     setTimeout(() => setUpdateSuccess(false), 3000);
    //   } else {
    //     // Handle error
    //   }
    // } catch (error) {
    //   console.error('Error updating profile:', error);
    // }
    
    // Simulate API call
    setTimeout(() => {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated && !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-3">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">My Account</h2>
                <p className="text-sm text-gray-500">Manage your account and orders</p>
              </div>
              
              <nav className="mt-6 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'profile'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'orders'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order History
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'addresses'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Addresses
                </button>

                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'payment'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Methods
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-9">
            {activeTab === 'profile' && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Profile</h2>
                
                {updateSuccess && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Profile updated successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                </div>
                
                {isLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't placed any orders yet.
                    </p>
                    <div className="mt-6">
                      <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        Start Shopping
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'DELIVERED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'SHIPPED' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'PROCESSING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'CANCELED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/order-confirmation/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Add New Address
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Home</h3>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 text-sm hover:text-indigo-900">Edit</button>
                        <button className="text-red-600 text-sm hover:text-red-900">Delete</button>
                      </div>
                    </div>
                    <address className="not-italic text-sm text-gray-600">
                      <p>John Doe</p>
                      <p>123 Main St</p>
                      <p>Anytown, CA 12345</p>
                      <p>United States</p>
                    </address>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Work</h3>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 text-sm hover:text-indigo-900">Edit</button>
                        <button className="text-red-600 text-sm hover:text-red-900">Delete</button>
                      </div>
                    </div>
                    <address className="not-italic text-sm text-gray-600">
                      <p>John Doe</p>
                      <p>456 Office Blvd, Suite 200</p>
                      <p>Business City, CA 67890</p>
                      <p>United States</p>
                    </address>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Add New Card
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Visa ending in 4242</h3>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 text-sm hover:text-indigo-900">Edit</button>
                        <button className="text-red-600 text-sm hover:text-red-900">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                    <p className="text-sm text-gray-600 mt-2">Default payment method</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Mastercard ending in 5555</h3>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 text-sm hover:text-indigo-900">Edit</button>
                        <button className="text-red-600 text-sm hover:text-red-900">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Expires 06/24</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 