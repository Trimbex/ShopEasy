'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';
import SearchBar from '../../components/search/SearchBar';
import { useSearchParams } from 'next/navigation';
import { productsApi } from '../../services/api';

// SWR fetcher function
const fetcher = async (url, { minRating, category } = {}) => {
  try {
    const response = await productsApi.getAll({ minRating, category });
    return response;
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
};

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  const [minRating, setMinRating] = useState(0);

  // Update selected categories when URL changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  // Enhanced SWR configuration
  const { data: products, error, mutate, isLoading, isValidating } = useSWR(
    ['products', { minRating, category: selectedCategories[0] }],
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      onError: (err) => {
        console.error('Error fetching products:', err);
      },
      onSuccess: (data) => {
        console.log('Products fetched successfully:', data?.length || 0);
      }
    }
  );

  // Refetch when minRating changes
  useEffect(() => {
    if (mutate) {
      mutate();
    }
  }, [minRating, mutate]);

  // Filter products based on search, categories, price range, and rating
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(product.category);
    
    const matchesPrice = product.price >= selectedPriceRange[0] && 
                        product.price <= selectedPriceRange[1];
    
    const matchesRating = minRating === 0 || 
                         (product.averageRating >= minRating);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  }) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'rating-high':
        return b.averageRating - a.averageRating;
      default:
        return 0;
    }
  });

  // Handle error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was a problem loading the products. Please try again later.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => mutate()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64">
          <ProductFilter
            categories={Array.from(new Set(products?.map(p => p.category) || []))}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            priceRange={priceRange}
            selectedPriceRange={selectedPriceRange}
            onPriceRangeChange={setSelectedPriceRange}
            selectedRating={minRating}
            onRatingChange={setMinRating}
          />
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <SearchBar />
          </div>
          
          <div className="mb-6 flex items-center justify-between">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating-high">Highest Rated</option>
            </select>
            
            {isValidating && (
              <span className="text-sm text-gray-500">
                Updating...
              </span>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedCategories.length > 0 && (
                <div className="flex items-center">
                  <span className="text-sm mr-2">Categories:</span>
                  {selectedCategories.map(cat => (
                    <span key={cat} className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center mr-1">
                      {cat}
                      <button 
                        onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {minRating > 0 && (
                <div className="flex items-center">
                  <span className="text-sm mr-2">Rating:</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center">
                    {minRating}+ Stars
                    <button 
                      onClick={() => setMinRating(0)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <ProductGrid 
            products={sortedProducts} 
            onProductUpdate={mutate}
            isValidating={isValidating}
          />
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 