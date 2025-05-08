'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Sample categories - these would normally come from an API
const SAMPLE_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Gadgets, devices, and other electronic items',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    productCount: 42
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Fashion items for all ages',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    productCount: 56
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Fiction, non-fiction, and educational books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    productCount: 28
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    description: 'Everything for your home',
    image: 'https://images.unsplash.com/photo-1556911220-bda9da8a1f2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80',
    productCount: 35
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    description: 'Skincare, makeup, and personal care items',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    productCount: 20
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    description: 'Equipment and gear for sports and outdoor activities',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    productCount: 30
  }
];

const CategoryCard = ({ category }) => {
  return (
    <Link 
      href={`/products?category=${category.id}`}
      className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl bg-white border border-gray-200"
    >
      <div className="flex-shrink-0 h-48 relative">
        <img
          className="h-full w-full object-cover"
          src={category.image}
          alt={category.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="absolute bottom-0 w-full p-4">
          <p className="text-white font-bold text-xl">{category.name}</p>
          <p className="text-white text-sm">{category.productCount} products</p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 flex flex-col">
        <p className="text-gray-800">{category.description}</p>
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white">
            Browse Category
          </span>
        </div>
      </div>
    </Link>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching categories from an API
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchCategories = () => {
      // Simulate API delay
      setTimeout(() => {
        setCategories(SAMPLE_CATEGORIES);
        setLoading(false);
      }, 500);
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-800 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Shop by Category
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Browse our wide selection of products by category to find exactly what you need
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Can't find what you're looking for?
          </h2>
          <Link 
            href="/products" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 