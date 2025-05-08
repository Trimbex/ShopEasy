'use client';

import Link from 'next/link';

const ProductCard = ({ product }) => {
  const { id, name, price, description, imageUrl, stock } = product;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105">
      <div className="relative">
        <Link href={`/products/${id}`}>
          <img 
            src={imageUrl || '/placeholder-product.jpg'} 
            alt={name}
            className="w-full h-48 object-cover"
          />
        </Link>
        {stock <= 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        {stock > 0 && stock < 5 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            Low Stock
          </span>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 mb-1">{name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${price.toFixed(2)}</span>
          <button 
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              stock > 0 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={stock <= 0}
            onClick={() => {
              // Comment: Add to cart functionality would go here
              console.log(`Add product ${id} to cart`);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 