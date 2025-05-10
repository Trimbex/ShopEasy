'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    getCartTotal, 
    getDiscountedTotal,
    appliedCoupon,
    discount,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [error, setError] = useState(null);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);

  // Add new state variables for shipping and tax
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderBreakdown, setOrderBreakdown] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  // Add US state tax rates map
  const STATE_TAX_RATES = {
    'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
    'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
    'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
    'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
    'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
    'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
    'NM': 0.05125, 'NY': 0.04, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
    'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
    'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.061, 'VT': 0.06,
    'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
    'DC': 0.06
  };
  
  // Default tax rate
  const DEFAULT_TAX_RATE = 0.06;

  // Helper function to get tax rate for a state
  const getStateTaxRate = (stateCode) => {
    if (!stateCode) return DEFAULT_TAX_RATE;
    
    // Convert to uppercase to match the keys in our map
    const upperStateCode = stateCode.toUpperCase();
    return STATE_TAX_RATES[upperStateCode] || DEFAULT_TAX_RATE;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?returnTo=/checkout');
    }
  }, [isAuthenticated, router]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderInProgress) {
      router.push('/cart');
    }
  }, [cartItems, router, orderInProgress]);

  // Check stock availability before proceeding with checkout
  useEffect(() => {
    const validateStock = async () => {
      try {
        // Skip validation if there are no items
        if (!cartItems.length) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
          // Use silent logging instead of console.error
          if (process.env.NODE_ENV === 'development') {
            console.log('No auth token available for stock validation');
          }
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Call a special endpoint just to validate stock without creating an order
          const response = await api.post('/orders/validate-stock', {
            items: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity
            }))
          });
          
          // Clear any previous stock errors
          setStockErrors([]);
        } catch (apiError) {
          // Handle the error without crashing
          const errorMessage = apiError.response?.data?.message || 
                              apiError.message || 
                              'Unknown API error';

          // Use silent logging instead of console.error
          if (process.env.NODE_ENV === 'development') {
            console.log('[STOCK VALIDATION]', {
              message: errorMessage,
              response: apiError.response?.data
            });
          }
          
          // Handle specific stock availability errors
          if (apiError.response?.data?.error === 'Insufficient stock') {
            const insufficientItems = apiError.response?.data?.items || [];
            if (insufficientItems.length > 0) {
              setStockErrors(insufficientItems);
            }
          } else {
            // Handle other API errors
            setError(`Stock validation failed: ${errorMessage}`);
          }
        }
      } catch (err) {
        // This catch block is for non-API errors (JavaScript errors)
        if (process.env.NODE_ENV === 'development') {
          console.log('[STOCK VALIDATION]', err);
        }
        setError(`An error occurred during stock validation: ${err.message || 'Unknown error'}`);
      }
    };
    
    validateStock();
  }, [cartItems]);

  // Hide error when cart changes
  useEffect(() => {
    if (stockErrors.length > 0) {
      setStockErrors([]);
    }
  }, [cartItems]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[CHECKOUT] Initial appliedCoupon:', appliedCoupon);
    }
  }, [isAuthenticated, appliedCoupon]);

  // Calculate estimated shipping and tax whenever the address, cart, or coupon changes
  useEffect(() => {
    const calculateOrderTotals = () => {
      const subtotal = getCartTotal();
      const discountedSubtotal = getDiscountedTotal();
      const discount = subtotal - discountedSubtotal;
      
      // Calculate estimated shipping (matching backend logic)
      let estimatedShipping = 0;
      if (subtotal < 50) {
        estimatedShipping = 9.99;
      } else if (subtotal < 100) {
        estimatedShipping = 5.99;
      }
      
      // Add international fee if not US
      if (formData.country && formData.country !== 'US') {
        estimatedShipping += 15;
      }
      
      // Estimate tax (US only, using state-specific rates)
      let estimatedTax = 0;
      if (!formData.country || formData.country === 'US') {
        // Get state-specific tax rate
        const taxRate = getStateTaxRate(formData.state);
        estimatedTax = discountedSubtotal * taxRate;
      }
      
      setShippingCost(estimatedShipping);
      setTaxAmount(estimatedTax);
      
      // Update order breakdown
      setOrderBreakdown({
        subtotal: subtotal,
        discount: discount,
        shipping: estimatedShipping,
        tax: estimatedTax,
        total: discountedSubtotal + estimatedShipping + estimatedTax
      });
    };
    
    calculateOrderTotals();
  }, [formData.country, formData.state, getCartTotal, getDiscountedTotal, cartItems, appliedCoupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate address
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    // State is required only for US addresses
    if ((!formData.country || formData.country === 'US') && !formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    
    // Validate payment info
    if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number is invalid';
    }
    
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiration date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Use format MM/YY';
    }
    
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }
    
    // Check stock errors before proceeding
    if (stockErrors.length > 0) {
      // Scroll to the top to show the error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setOrderInProgress(true);

    try {
      // Log the coupon before creating the order
      if (process.env.NODE_ENV === 'development') {
        console.log('Coupon being used for order:', appliedCoupon);
      }
      
      // Create order data with careful handling of couponId
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country || 'US' // Default to US if empty
        },
        paymentInfo: {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        },
        // Explicitly handle couponId to ensure it's not undefined
        couponId: appliedCoupon?.id || null,
        total: orderBreakdown.total // Use calculated total with shipping & tax
      };
      
      // Log the order data
      if (process.env.NODE_ENV === 'development') {
        console.log('Order data being sent:', orderData);
      }

      // Make sure we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }
      
      // Set the authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Submit the order with explicit try/catch
      try {
        const response = await api.post('/orders', orderData);
        if (process.env.NODE_ENV === 'development') {
          console.log('Order created successfully:', response.data);
        }
        
        // Clear the cart after successful order submission
        clearCart();
        
        // Make sure we have an order ID before redirecting
        if (response.data && response.data.id) {
          // Redirect to the order confirmation page
          await router.push(`/order-confirmation/${response.data.id}`);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Missing order ID in response:', response.data);
          }
          throw new Error('Order was created but no order ID was returned');
        }
      } catch (apiError) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ORDER SUBMISSION]', {
            status: apiError.response?.status,
            data: apiError.response?.data,
            message: apiError.message
          });
        }
        
        // Handle specific stock availability errors
        if (apiError.response?.data?.error === 'Insufficient stock') {
          const insufficientItems = apiError.response?.data?.items || [];
          let stockErrorMessage = 'Some items in your cart are out of stock or have insufficient stock:';
          
          if (insufficientItems.length > 0) {
            insufficientItems.forEach(item => {
              stockErrorMessage += `\n• ${item.productName}: Available: ${item.availableStock}, Requested: ${item.requestedQuantity}`;
            });
            stockErrorMessage += '\n\nPlease update your cart before continuing.';
          }
          
          setError(stockErrorMessage);
          setStockErrors(insufficientItems);
          setOrderInProgress(false);
          return;
        }
        
        // Set a generic error message if no specific data available
        if (!apiError.response) {
          setError(`Network error: ${apiError.message || 'Cannot connect to server'}`);
          setOrderInProgress(false);
          return;
        }
        
        throw apiError;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ORDER API]', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      }
      
      let errorMessage = 'Failed to process your order. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // For clearer error handling on specific error types
        if (err.response?.data?.message) {
          errorMessage += ': ' + err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setOrderInProgress(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      // Ensure token is set
      const token = localStorage.getItem('token');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Make the API call
      const response = await api.post('/coupons/apply', {
        alias: couponCode,
        orderTotal: getCartTotal()
      });
      
      // Get the data from the response
      const data = response.data;
      
      // Ensure couponId exists
      if (!data.couponId) {
        throw new Error('Coupon ID is missing from API response');
      }
      
      // Create a coupon object with proper structure
      const coupon = {
        id: data.couponId,
        alias: data.alias,
        percentDiscount: data.percentDiscount
      };
      
      // Apply the coupon
      applyCoupon(coupon, data.discount);
      setCouponError(null);
    } catch (error) {
      // Silent logging in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Error applying coupon:', error);
      }
      setCouponError(error.response?.data?.error || 'Invalid coupon code');
      removeCoupon();
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[COUPON] Removing coupon, current state:', appliedCoupon);
    }
    removeCoupon();
    setCouponCode('');
    setCouponError(null);
    if (process.env.NODE_ENV === 'development') {
      console.log('[COUPON] After removing, appliedCoupon should be null');
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {stockErrors.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Insufficient Stock</h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700 mb-2">
                    Some items in your cart have insufficient stock available:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {stockErrors.map((item, index) => (
                      <li key={index} className="text-sm text-red-700">
                        <span className="font-medium">{item.productName}</span>: 
                        <span className="ml-1">Available: <span className="font-medium">{item.availableStock}</span>,</span>
                        <span className="ml-1">Requested: <span className="font-medium">{item.requestedQuantity}</span></span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link
                      href="/cart"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Update Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit}>
              {/* Customer Information */}
              <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    {formData.country === 'US' ? (
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 block w-full bg-white border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        <option value="">Select State</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                        <option value="DC">District of Columbia</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      />
                    )}
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      Zip code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Name on card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className={`mt-1 block w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiration date (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className={`mt-1 block w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Apply Coupon</h2>
                
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Coupon Applied: {appliedCoupon.alias}
                        </h3>
                        <div className="mt-1 text-sm text-green-700">
                          <p>{appliedCoupon.percentDiscount}% discount has been applied to your order.</p>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Remove Coupon
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      {couponError && (
                        <p className="mt-1 text-sm text-red-600">{couponError}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isApplyingCoupon ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link href="/cart" className="text-indigo-600 hover:text-indigo-500">
                  ← Back to cart
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart items */}
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${orderBreakdown.subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({appliedCoupon.percentDiscount}%)</span>
                    <span>-${orderBreakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${orderBreakdown.shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    ${orderBreakdown.tax.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">${orderBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Coupon code section */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                {appliedCoupon ? (
                  <div className="bg-green-50 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Coupon code <span className="font-bold">{appliedCoupon.alias}</span> applied!
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="mt-1 text-sm text-green-700 hover:text-green-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      name="couponCode"
                      id="couponCode"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isApplyingCoupon ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                
                {couponError && (
                  <p className="mt-2 text-sm text-red-600">{couponError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 