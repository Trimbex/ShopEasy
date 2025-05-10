import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Update stock levels for all products in an order (decrease)
export const decrementStockForOrder = async (orderItems) => {
  try {
    // Validate input
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      throw new Error('Invalid order items');
    }

    // Process each order item
    const stockUpdates = await Promise.all(
      orderItems.map(async (item) => {
        // Get current product
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        // Ensure there's enough stock
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        
        // Update product stock
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
        
        return {
          productId: item.productId,
          productName: updatedProduct.name,
          previousStock: product.stock,
          newStock: updatedProduct.stock,
          quantityDecremented: item.quantity
        };
      })
    );
    
    return stockUpdates;
  } catch (error) {
    console.error('Error decrementing stock:', error);
    throw error;
  }
};

// Restore stock levels for all products in a canceled order (increase)
export const incrementStockForOrder = async (orderItems) => {
  try {
    // Validate input
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      throw new Error('Invalid order items');
    }
    
    // Process each order item
    const stockUpdates = await Promise.all(
      orderItems.map(async (item) => {
        // Get current product
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        // Update product stock (increment)
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock + item.quantity }
        });
        
        return {
          productId: item.productId,
          productName: updatedProduct.name,
          previousStock: product.stock,
          newStock: updatedProduct.stock,
          quantityIncremented: item.quantity
        };
      })
    );
    
    return stockUpdates;
  } catch (error) {
    console.error('Error incrementing stock:', error);
    throw error;
  }
};

export const checkLowStock = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  return {
    isLowStock: product.stock <= product.lowStockThreshold,
    currentStock: product.stock,
    threshold: product.lowStockThreshold
  };
}; 