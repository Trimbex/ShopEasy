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

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          console.log('Cart loaded from localStorage:', parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load cart data');
        localStorage.removeItem('cart');
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
    if (isAuthenticated && cartItems.length > 0) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        console.log('Cart saved to localStorage:', cartItems);
      } catch (error) {
        console.error('Error saving cart:', error);
        setError('Failed to save cart data');
      }
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = (product, quantity = 1) => {
    try {
      if (!isAuthenticated) {
        setError('Please sign in to add items to cart');
        return;
      }

      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        
        return [...prevItems, { ...product, quantity }];
      });

      setError(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
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

  const updateQuantity = (productId, quantity) => {
    try {
      if (!isAuthenticated) {
        setError('Please sign in to update cart');
        return;
      }

      if (quantity < 1) {
        removeFromCart(productId);
        return;
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
    setCartItems([]);
    localStorage.removeItem('cart');
    setAppliedCoupon(null);
    setDiscount(0);
    setError(null);
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
    return cartItems.reduce((count, item) => count + item.quantity, 0);
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