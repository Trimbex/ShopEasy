import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  // Get all products
  getAll: async (params = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.category) {
      queryParams.append('category', params.category);
    }
    
    if (params.minRating && params.minRating > 0) {
      queryParams.append('minRating', params.minRating);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single product
  getOne: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};

// Reviews API
export const reviewsApi = {
  // Get reviews for a product
  getForProduct: async (productId) => {
    const response = await api.get(`/reviews/products/${productId}`);
    return response.data;
  },

  // Create a review
  create: async (reviewData, token) => {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const response = await api.post('/reviews', reviewData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  },

  // Update a review
  update: async (reviewId, reviewData, token) => {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const response = await api.put(`/reviews/${reviewId}`, reviewData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  },

  // Delete a review
  delete: async (reviewId, token) => {
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    await api.delete(`/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
};

// User API
export const userApi = {
  // Update user profile (name and/or password)
  updateProfile: async (data, token) => {
    const response = await api.put('/auth/me', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default api; 