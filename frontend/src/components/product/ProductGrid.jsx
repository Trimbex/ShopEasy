'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { productsApi } from '../../services/api';

const ProductGrid = ({ products, onProductUpdate, isValidating }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsDeleting(true);
        await productsApi.delete(productId);
        onProductUpdate(); // This will trigger a revalidation of the products list
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isValidating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={() => handleDelete(product.id)}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid; 