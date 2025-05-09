import { PrismaClient } from '@prisma/client';
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
        }
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
        }
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
    const { shippingInfo, paymentInfo, items } = req.body;
    const userId = req.user.id;

    console.log('Creating order for user:', userId);
    console.log('Shipping info:', shippingInfo);
    console.log('Items:', items);

    let orderItems = [];
    let total = 0;

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

      // Calculate total and prepare order items
      orderItems = items.map((item, index) => {
        const product = products[index];
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
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

      // Calculate total and prepare order items from cart
      orderItems = cart.items.map(item => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
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

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        shippingInfo,
        paymentInfo,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('Order created:', order.id);
    res.status(201).json(order);
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
        }
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
        }
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