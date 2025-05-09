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

// Campaigns API
export const campaignsApi = {
  // Get active campaigns for public display
  getActive: async () => {
    const response = await api.get('/campaigns/active');
    return response.data;
  },
  
  // Admin: Get all campaigns
  getAll: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },
  
  // Admin: Get a single campaign
  getOne: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  
  // Admin: Create a new campaign
  create: async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  },
  
  // Admin: Update a campaign
  update: async (id, campaignData) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },
  
  // Admin: Delete a campaign
  delete: async (id) => {
    await api.delete(`/campaigns/${id}`);
  }
};

// Telemetry API
export const telemetryApi = {
  getOverviewMetrics: async () => {
    const { data } = await api.get('/telemetry/overview');
    return data;
  },
  getCouponMetrics: async () => {
    const { data } = await api.get('/telemetry/coupons');
    return data;
  },
  getCampaignMetrics: async () => {
    const { data } = await api.get('/telemetry/campaigns');
    return data;
  }
};

export default api; 