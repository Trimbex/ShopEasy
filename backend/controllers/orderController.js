import { PrismaClient } from '@prisma/client';
import { calculateShipping, calculateTax } from '../utils/calculations.js';
const prisma = new PrismaClient();

// Get all orders (admin only)
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user is admin or the order belongs to the user
    if (!req.user.isAdmin && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

// Create new order from cart
export const createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentInfo, items, couponId, total } = req.body;
    
    // Validate required fields
    if (!shippingInfo || !paymentInfo) {
      return res.status(400).json({ 
        error: 'Missing required information',
        message: 'Shipping and payment information are required'
      });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to place an order'
      });
    }
    
    const userId = req.user.id;

    console.log('------- ORDER CREATION -------');
    console.log('User ID:', userId);
    console.log('Coupon ID:', couponId);
    console.log('Request body:', JSON.stringify({
      itemsCount: items?.length || 0,
      hasShippingInfo: !!shippingInfo,
      hasPaymentInfo: !!paymentInfo,
      couponId: couponId || 'none'
    }));

    let orderItems = [];
    let subtotal = 0;
    let finalTotal = 0;
    let appliedCoupon = null;

    // If items are provided directly, use them
    if (items && items.length > 0) {
      // Fetch product details for each item
      const products = await Promise.all(
        items.map(item => 
          prisma.product.findUnique({
            where: { id: item.productId }
          })
        )
      );

      // Validate all products exist
      if (products.some(p => !p)) {
        return res.status(400).json({
          error: 'Invalid products',
          message: 'One or more products not found'
        });
      }

      // Calculate subtotal and prepare order items
      orderItems = items.map((item, index) => {
        const product = products[index];
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        };
      });
    } else {
      // Otherwise, try to use the cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ 
          error: 'No items provided',
          message: 'Please provide items or add items to your cart before checking out'
        });
      }

      // Calculate subtotal and prepare order items from cart
      orderItems = cart.items.map(item => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        return {
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        };
      });

      // Clear the cart after order creation
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    // Apply coupon if provided
    if (couponId) {
      appliedCoupon = await prisma.coupon.findUnique({
        where: { id: couponId }
      });

      if (!appliedCoupon) {
        return res.status(400).json({
          error: 'Invalid coupon',
          message: 'The provided coupon does not exist'
        });
      }

      // Validate coupon
      if (!appliedCoupon.isRunning) {
        return res.status(400).json({
          error: 'Inactive coupon',
          message: 'This coupon is not currently active'
        });
      }

      const now = new Date();
      if (now < appliedCoupon.issuedAt) {
        return res.status(400).json({
          error: 'Coupon not yet valid',
          message: 'This coupon is not yet valid'
        });
      }

      if (now > appliedCoupon.expiresAt) {
        return res.status(400).json({
          error: 'Expired coupon',
          message: 'This coupon has expired'
        });
      }

      if (subtotal < Number(appliedCoupon.minPrice)) {
        return res.status(400).json({
          error: 'Order total too low',
          message: `Order total must be at least $${appliedCoupon.minPrice}`
        });
      }

      // Check usage limits
      const usageCount = await prisma.order.count({
        where: { couponId }
      });

      if (appliedCoupon.maxUsesTotal && usageCount >= appliedCoupon.maxUsesTotal) {
        return res.status(400).json({
          error: 'Usage limit reached',
          message: 'This coupon has reached its maximum usage limit'
        });
      }

      const userUsageCount = await prisma.order.count({
        where: {
          couponId,
          userId
        }
      });

      if (appliedCoupon.maxUsesPerUser && userUsageCount >= appliedCoupon.maxUsesPerUser) {
        return res.status(400).json({
          error: 'User limit reached',
          message: 'You have reached the maximum usage limit for this coupon'
        });
      }

      // Calculate discount
      const discount = (subtotal * appliedCoupon.percentDiscount) / 100;
      finalTotal = subtotal - discount;
    } else {
      finalTotal = subtotal;
    }

    // Calculate shipping and tax
    const shippingCost = calculateShipping(subtotal, shippingInfo);
    const taxAmount = calculateTax(finalTotal, shippingInfo);
    
    // Add shipping and tax to final total
    finalTotal += shippingCost + taxAmount;

    // Create the order
    console.log('Creating order with coupon ID:', couponId);
    console.log('Order details:', {
      subtotal,
      shippingCost,
      taxAmount,
      finalTotal
    });
    
    // Validate coupon ID if provided
    if (couponId) {
      const couponExists = await prisma.coupon.findUnique({
        where: { id: couponId }
      });
      
      if (!couponExists) {
        console.error('Coupon not found with ID:', couponId);
      } else {
        console.log('Found coupon:', couponExists.alias);
      }
    }
    
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: orderItems
        },
        total: finalTotal,
        shippingInfo: {
          ...shippingInfo,
          shippingCost,
          taxAmount
        },
        paymentInfo,
        couponId: couponId
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      }
    });
    
    console.log('Order created with coupon ID:', order.couponId);
    
    res.status(201).json({
      ...order,
      breakdown: {
        subtotal,
        shippingCost,
        taxAmount,
        discount: appliedCoupon ? (subtotal * appliedCoupon.percentDiscount) / 100 : 0,
        total: finalTotal
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Error creating order',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error updating order' });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching user orders' });
  }
};

// Cancel order (user can cancel their own orders)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the user
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // Check if the order is in a cancellable state
    if (order.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Cannot cancel order',
        message: 'Only pending orders can be canceled'
      });
    }

    // Update the order status to CANCELED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELED' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ 
      error: 'Error canceling order',
      message: error.message
    });
  }
}; 