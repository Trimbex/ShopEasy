'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, loading: authLoading, error: authError, setError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Set active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'addresses'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login?returnTo=/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data and orders
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
      }));

      const fetchOrders = async () => {
        try {
          // Set the auth token for this request
          api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
          
          const { data } = await api.get('/orders/user');
          setOrders(data);
          setProfileError(null);
        } catch (error) {
          console.error('Error fetching orders:', error);

          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
          setProfileError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOrders();
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
    setProfileError(null);
    try {
      const payload = { name: profileForm.name };
      if (profileForm.currentPassword && profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const result = await updateProfile(payload);
      if (result.success) {
        setUpdateSuccess(true);
        setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
      // error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCancelOrder = async (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setIsCanceling(true);
    try {
      // Set the auth token for this request
      api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      
      const { data } = await api.put(`/orders/${orderToCancel}/cancel`);
      
      // Update the orders list with the canceled order
      setOrders(orders.map(order => 
        order.id === orderToCancel ? { ...order, status: 'CANCELED' } : order
      ));
      
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error canceling order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
      setProfileError(errorMessage);
    } finally {
      setIsCanceling(false);
    }
  };

  if (!isAuthenticated && !user) {
    return null; // Will redirect in useEffect
  }

  const renderOrders = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      );
    }

    if (profileError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
              <p className="mt-1 text-sm text-red-700">{profileError}</p>
            </div>
          </div>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new order.</p>
          <div className="mt-6">
            <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Browse Products
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
          const discount = order.coupon ? (subtotal * order.coupon.percentDiscount) / 100 : 0;
          const shippingEstimate = subtotal > 50 ? 0 : 5.99;
          const taxEstimate = (subtotal - discount) * 0.08;
          const total = order.total;

          return (
            <div key={order.id} className={`bg-white shadow-sm rounded-lg p-6 ${
              order.status === 'CANCELED' ? 'opacity-60' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-lg font-medium ${
                    order.status === 'CANCELED' ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    Order #{order.id}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    order.status === 'CANCELED' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'CANCELED' ? 'bg-gray-100 text-gray-500' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className={`${
                    order.status === 'CANCELED' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total
                  </span>
                  <span className={`font-medium ${
                    order.status === 'CANCELED' ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {order.coupon ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                          {order.coupon.percentDiscount}% off with {order.coupon.alias}
                        </span>
                        <span>${Number(order.total).toFixed(2)}</span>
                      </div>
                    ) : (
                      `$${Number(order.total).toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href={`/order-confirmation/${order.id}`} 
                  className={`text-sm font-medium ${
                    order.status === 'CANCELED' 
                      ? 'text-gray-400 hover:text-gray-500' 
                      : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                >
                  View details <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
                          disabled
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Change Password
                        <span className="block text-xs font-normal text-gray-400">Leave blank if you don't want to change your password</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={profileForm.currentPassword}
                          onChange={handleProfileChange}
                          autoComplete="current-password"
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Current Password"
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={profileForm.newPassword}
                          onChange={handleProfileChange}
                          autoComplete="new-password"
                          className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="New Password"
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="text-red-600 text-sm">{authError}</div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || authLoading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          isSubmitting || authLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {(isSubmitting || authLoading) ? 'Saving...' : 'Save Changes'}
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
                
                {renderOrders()}
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
      
      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Cancel Order</h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setOrderToCancel(null);
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={isCanceling}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  isCanceling ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isCanceling ? 'Canceling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 