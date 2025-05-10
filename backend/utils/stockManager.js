import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const decrementProductStock = async (items) => {
  try {
    // Use a transaction to ensure all stock updates are atomic
    return await prisma.$transaction(async (tx) => {
      const updatedProducts = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            },
            // Update low stock status
            isLowStock: product.stock - item.quantity <= product.lowStockThreshold
          }
        });

        updatedProducts.push(updatedProduct);
      }

      return updatedProducts;
    });
  } catch (error) {
    console.error('Error decrementing stock:', error);
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