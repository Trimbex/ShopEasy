import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Special logging for coupon-related requests
    if (config.url?.includes('/coupons')) {
      console.log('[API REQUEST] Coupon request:', {
        url: config.url,
        method: config.method,
        data: config.data
      });
    }
    
    // Special logging for order-related requests
    if (config.url?.includes('/orders')) {
      console.log('[API REQUEST] Order request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Special logging for coupon-related responses
    if (response.config.url?.includes('/coupons')) {
      console.log('[API RESPONSE] Coupon response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    
    // Special logging for order-related responses
    if (response.config.url?.includes('/orders')) {
      console.log('[API RESPONSE] Order response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Extended error logging for order-related errors
    if (error.config?.url?.includes('/orders')) {
      console.error('[ORDER API ERROR]', {
        request: {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
          headers: error.config.headers
        },
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        message: error.message
      });
    } else {
      // Log the full error for debugging
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

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