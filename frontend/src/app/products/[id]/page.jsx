'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { productsApi } from '../../../services/api';
import ProductDetail from '../../../components/product/ProductDetail';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productsApi.getOne(id);
        setProduct(data);
      } catch (err) {
        setError({
          message: err.response?.data?.message || 'Failed to load product details'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProductDetail
        product={product}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
} 