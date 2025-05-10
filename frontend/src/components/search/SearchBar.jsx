'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash'; // Make sure to install lodash if not already installed

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Create a debounced function for search to avoid too many router updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        router.push(`/products?search=${encodeURIComponent(term.trim())}`);
      } else if (searchParams.get('search')) {
        // Clear search from URL if search term is empty
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
      }
    }, 300),
    [router, searchParams]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Manual form submission still available but not required
  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSearch.cancel();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else if (searchParams.get('search')) {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search products..."
          className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-3 flex items-center bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
          aria-label="Search"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar; 