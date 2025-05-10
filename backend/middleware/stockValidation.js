import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const validateStockAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Order items are required and must be an array'
      });
    }

    // Check stock for each item
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Add validated items to request for use in next middleware/controller
    req.validatedItems = items;
    next();
  } catch (error) {
    console.error('Stock validation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error validating stock availability'
    });
  }
}; 