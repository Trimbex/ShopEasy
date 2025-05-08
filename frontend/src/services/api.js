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
  getAll: async () => {
    const response = await api.get('/products');
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

export default api; 