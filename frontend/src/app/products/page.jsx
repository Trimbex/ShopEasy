'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';
import SearchBar from '../../components/search/SearchBar';
import { useSearchParams } from 'next/navigation';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Fetch products - normally this would be from an API
  useEffect(() => {
    // Comment: This would fetch from the API
    // const fetchProducts = async () => {
    //   try {
    //     const response = await fetch('/api/products');
    //     const data = await response.json();
    //     setProducts(data);
    //     setFilteredProducts(data);
    //     
    //     // Get unique categories
    //     const uniqueCategories = [...new Set(data.map(product => product.category))].filter(Boolean);
    //     setCategories(uniqueCategories);
    //     
    //     // Get min and max prices
    //     const prices = data.map(product => parseFloat(product.price));
    //     setPriceRange([Math.min(...prices), Math.max(...prices)]);
    //     setSelectedPriceRange([Math.min(...prices), Math.max(...prices)]);
    //   } catch (error) {
    //     console.error('Error fetching products:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    
    // Mock data
    setTimeout(() => {
      const mockProducts = [
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 99.99,
          description: 'Premium sound quality with noise cancellation technology.',
          imageUrl: '/images/products/headphones.jpg',
          category: 'Electronics',
          stock: 15
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          price: 129.99,
          description: 'Track your fitness goals with this advanced smartwatch.',
          imageUrl: '/images/products/watch.jpg',
          category: 'Electronics',
          stock: 8
        },
        {
          id: '3',
          name: 'Portable Bluetooth Speaker',
          price: 49.99,
          description: 'Take your music anywhere with this waterproof portable speaker.',
          imageUrl: '/images/products/speaker.jpg',
          category: 'Electronics',
          stock: 12
        },
        {
          id: '4',
          name: 'Ultra HD Action Camera',
          price: 199.99,
          description: 'Capture your adventures in stunning 4K resolution.',
          imageUrl: '/images/products/camera.jpg',
          category: 'Electronics',
          stock: 5
        },
        {
          id: '5',
          name: 'Leather Wallet',
          price: 39.99,
          description: 'Genuine leather wallet with multiple card slots.',
          imageUrl: '/images/products/wallet.jpg',
          category: 'Fashion',
          stock: 20
        },
        {
          id: '6',
          name: 'Stainless Steel Water Bottle',
          price: 24.99,
          description: 'Keep your drinks hot or cold for hours.',
          imageUrl: '/images/products/bottle.jpg',
          category: 'Home & Kitchen',
          stock: 30
        },
        {
          id: '7',
          name: 'Organic Face Cream',
          price: 29.99,
          description: 'Hydrating face cream made with organic ingredients.',
          imageUrl: '/images/products/cream.jpg',
          category: 'Beauty',
          stock: 25
        },
        {
          id: '8',
          name: 'Yoga Mat',
          price: 34.99,
          description: 'Non-slip yoga mat for all types of yoga.',
          imageUrl: '/images/products/yoga-mat.jpg',
          category: 'Sports & Outdoors',
          stock: 18
        }
      ];
      
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      
      // Get unique categories
      const uniqueCategories = [...new Set(mockProducts.map(product => product.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
      // Get min and max prices
      const prices = mockProducts.map(product => parseFloat(product.price));
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
      setSelectedPriceRange([Math.min(...prices), Math.max(...prices)]);
      
      setIsLoading(false);
    }, 1000);

    // fetchProducts();
  }, []);

  // Filter products whenever filters change
  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= selectedPriceRange[0] && price <= selectedPriceRange[1];
    });

    // Sort products
    switch (sortOption) {
      case 'price_low_high':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_high_low':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        // This would normally sort by date - just keeping the current order for the mock
        break;
      case 'rating':
        // This would normally sort by rating - just a random sort for the mock
        filtered.sort(() => Math.random() - 0.5);
        break;
      default:
        // 'featured' - default sorting
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategories, selectedPriceRange, sortOption, searchQuery]);

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle price range filter change
  const handlePriceChange = (range) => {
    setSelectedPriceRange(range);
  };

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <ProductFilter 
              categories={categories}
              priceRange={priceRange}
              selectedCategories={selectedCategories}
              selectedPriceRange={selectedPriceRange}
              sortOption={sortOption}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onSort={handleSortChange}
            />
          </div>

          {/* Mobile filter */}
          <div className="lg:hidden mb-6">
            <ProductFilter 
              categories={categories}
              priceRange={priceRange}
              selectedCategories={selectedCategories}
              selectedPriceRange={selectedPriceRange}
              sortOption={sortOption}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onSort={handleSortChange}
            />
          </div>

          {/* Product grid */}
          <div className="lg:col-span-3">
            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 