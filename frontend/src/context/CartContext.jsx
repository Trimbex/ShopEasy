'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Clean up potentially corrupted localStorage data on initial mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          // Test if the data can be parsed
          JSON.parse(savedCart);
        } catch (parseError) {
          // If parsing fails, clear the corrupted data
          console.error('Corrupted cart data detected, clearing localStorage');
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // In case of any localStorage access error, try to clear it
      try {
        localStorage.removeItem('cart');
      } catch (clearError) {
        console.error('Failed to clear localStorage:', clearError);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
              console.log('Cart loaded from localStorage:', parsedCart);
            } else {
              // If parsed data is not an array, reset it
              console.error('Saved cart is not an array, resetting cart');
              localStorage.removeItem('cart');
              setCartItems([]);
            }
          } catch (parseError) {
            console.error('Error parsing cart JSON:', parseError);
            localStorage.removeItem('cart');
            setCartItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load cart data');
        localStorage.removeItem('cart');
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    try {
      if (cartItems.length > 0) {
        try {
          const serializedCart = JSON.stringify(cartItems);
          localStorage.setItem('cart', serializedCart);
          console.log('Cart saved to localStorage');
        } catch (stringifyError) {
          console.error('Error stringifying cart:', stringifyError);
          // Don't update localStorage with invalid data
        }
      } else {
        // Clear localStorage when cart is empty
        localStorage.removeItem('cart');
        console.log('Cart cleared from localStorage');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
      setError('Failed to save cart data');
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = (product, quantity = 1) => {
    try {
      if (!isAuthenticated) {
        const error = new Error('Please sign in to add items to cart');
        setError(error.message);
        throw error;
      }

      // Validate stock
      if (product.stock < quantity) {
        const errorMessage = `Stock Error: Sorry, only ${product.stock} units available for ${product.name}`;
        setError(errorMessage);
        return false;
      }

      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          // Check if total quantity exceeds stock
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stock) {
            const errorMessage = `Stock Error: Sorry, only ${product.stock} units available for ${product.name}`;
            setError(errorMessage);
            return prevItems; // Return unchanged items
          }
          
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        }
        
        return [...prevItems, { ...product, quantity }];
      });

      setError(null);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add item to cart');
      return false;
    }
  };

  const removeFromCart = (productId) => {
    try {
      if (!isAuthenticated) {
        setError('Please sign in to remove items from cart');
        return;
      }

      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      setError(null);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (!isAuthenticated) {
        setError('Please sign in to update cart');
        return;
      }

      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }

      // Check if the requested quantity is in stock
      const item = cartItems.find(item => item.id === productId);
      if (!item) {
        setError('Item not found in cart');
        return;
      }

      // Fetch latest product info to get current stock
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          
          if (quantity > productData.stock) {
            setError(`Stock Error: Sorry, only ${productData.stock} units available for ${item.name}`);
            return;
          }
        }
      } catch (fetchError) {
        console.error('Error fetching product stock:', fetchError);
        // Continue with update even if fetch fails
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
      setError(null);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    }
  };

  const clearCart = () => {
    try {
      // Clear cart from localStorage first
      localStorage.removeItem('cart');
      
      // Then update state
      setCartItems([]);
      setAppliedCoupon(null);
      setDiscount(0);
      setError(null);
      
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountedTotal = () => {
    const subtotal = getCartTotal();
    return subtotal - discount;
  };

  const applyCoupon = (coupon, discountAmount) => {
    console.log('CartContext: Applying coupon with data:', {
      coupon,
      discountAmount,
      hasId: !!coupon?.id,
      type: typeof coupon?.id
    });
    
    // Ensure the coupon has an ID
    if (!coupon || !coupon.id) {
      console.error('Invalid coupon data - missing ID:', coupon);
      return;
    }
    
    // Store the coupon with the ID explicitly
    setAppliedCoupon({
      id: coupon.id,
      alias: coupon.alias,
      percentDiscount: coupon.percentDiscount
    });
    
    // Set the discount amount
    setDiscount(discountAmount);
    
    console.log('Coupon applied with ID:', coupon.id);
  };

  const removeCoupon = () => {
    console.log('Removing coupon');
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const getCartCount = () => {
    if (!cartItems || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const value = {
    cartItems,
    isLoading,
    error,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getDiscountedTotal,
    appliedCoupon,
    discount,
    applyCoupon,
    removeCoupon,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 