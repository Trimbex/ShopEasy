'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

const AdminPanel = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, user]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        if (isAuthenticated && user?.isAdmin) {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setStats(data.stats);
          } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to fetch admin data');
          }
        }
      } catch (err) {
        setError('Error fetching admin data');
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchLowStockCount = async () => {
      try {
        if (isAuthenticated && user?.isAdmin) {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/products/low-stock', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Store the actual low stock products for the alert
            setLowStockProducts(data);
            // Count out of stock items separately
            const outOfStockCount = data.filter(p => p.stock === 0).length;
            const lowStockCount = data.length - outOfStockCount;
            setLowStockCount(lowStockCount);
            setOutOfStockCount(outOfStockCount);
          }
        }
      } catch (err) {
        console.error('Error fetching low stock count:', err);
      }
    };

    if (isAuthenticated && user?.isAdmin) {
      fetchAdminStats();
      fetchLowStockCount();
    }
  }, [isAuthenticated, user]);

  if (loading || (!isAuthenticated || !user?.isAdmin)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:items-center lg:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-lg text-gray-600">
              Manage your store's products, orders, and customers
            </p>
          </div>
        </div>

        {/* Low Stock Alert Box */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">
                  Inventory Alert: {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} {lowStockProducts.length === 1 ? 'is' : 'are'} low on stock
                </p>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {outOfStockCount > 0 && (
                      <li><strong>{outOfStockCount} product{outOfStockCount !== 1 ? 's' : ''} out of stock</strong></li>
                    )}
                    {lowStockCount > 0 && (
                      <li>{lowStockCount} product{lowStockCount !== 1 ? 's' : ''} running low</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loadingStats ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalOrders || 0}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalProducts || 0}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recent Orders</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.recentOrders || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Admin Navigation */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Products</h3>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500">Manage your store's product catalog</p>
                  </div>
                  <div className="mt-5">
                    <Link href="/admin/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Manage Products
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500">View and manage customer orders</p>
                  </div>
                  <div className="mt-5">
                    <Link href="/admin/orders" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Manage Orders
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Coupons</h3>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500">Create and manage discount coupons</p>
                  </div>
                  <div className="mt-5">
                    <Link href="/admin/coupons" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Manage Coupons
                    </Link>
                  </div>
                </div>
              </div>

              {/* Inventory Management Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500">Monitor and manage product stock levels</p>
                  </div>
                  <div className="mt-5">
                    <Link href="/admin/inventory" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Manage Inventory
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 