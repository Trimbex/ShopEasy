'use client';

import Link from 'next/link';
import ProductGrid from '../components/product/ProductGrid';
import { useState, useEffect } from 'react';
import { productsApi } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productsApi.getAll();
        setFeaturedProducts(products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section with higher contrast */}
      <div className="relative bg-gradient-to-r from-indigo-800 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Shop the Best</span>
              <span className="block">Products Online</span>
            </h1>
            <p className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
              Find everything you need with our wide selection of high-quality products at great prices.
            </p>
            <div className="mt-8 sm:mt-12">
              <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                Shop Now
              </Link>
              <Link href="/categories" className="ml-4 inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-700">
            Discover our most popular items
          </p>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-700"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
          <div className="mt-8 text-center">
            <Link href="/products" className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-700">
              Browse our collections
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative">
              <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:h-64">
                <img
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Electronics Category"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                <Link href="/products?category=electronics">
                  <span className="absolute inset-0" />
                  Electronics
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-700">Shop the latest gadgets and devices</p>
            </div>

            <div className="group relative">
              <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:h-64">
                <img
                  src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Clothing Category"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                <Link href="/products?category=clothing">
                  <span className="absolute inset-0" />
                  Clothing
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-700">Stylish clothes for all occasions</p>
            </div>

            <div className="group relative">
              <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:h-64">
                <img
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                  alt="Books Category"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                <Link href="/products?category=books">
                  <span className="absolute inset-0" />
                  Books
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-700">Bestsellers, classics, and more</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/categories" className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
              View All Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Special Offers */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Special Offers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white">
            Limited-time deals you don't want to miss!
          </p>
          <div className="mt-8">
            <Link href="/products?discount=true" className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
              Shop Deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
