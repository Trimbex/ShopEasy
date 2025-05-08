'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi } from '../../services/api';

const CategoryCard = ({ category, imageUrl, productCount }) => {
  return (
    <Link 
      href={`/products?category=${category}`}
      className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl bg-white border border-gray-200"
    >
      <div className="flex-shrink-0 h-48 relative">
        <img
          className="h-full w-full object-cover"
          src={imageUrl}
          alt={category}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="absolute bottom-0 w-full p-4">
          <p className="text-white font-bold text-xl capitalize">{category}</p>
          <p className="text-white text-sm">{productCount} products</p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 flex flex-col">
        <p className="text-gray-800">Browse our collection of {category} products</p>
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const products = await productsApi.getAll();
        // Get unique categories and their product counts
        const categoryMap = products.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = {
              count: 0,
              imageUrl: product.imageUrl
            };
          }
          acc[product.category].count++;
          return acc;
        }, {});

        // Convert to array format
        const categoryList = Object.entries(categoryMap).map(([category, data]) => ({
          category,
          productCount: data.count,
          imageUrl: data.imageUrl
        }));

        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
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
          {categories.map(({ category, imageUrl, productCount }) => (
            <CategoryCard 
              key={category} 
              category={category}
              imageUrl={imageUrl}
              productCount={productCount}
            />
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