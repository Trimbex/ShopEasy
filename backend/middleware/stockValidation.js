import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const validateStockAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Order items are required and must be a non-empty array'
      });
    }

    // Store insufficient stock items to report all issues at once
    const insufficientStockItems = [];
    const notFoundItems = [];
    const validatedItems = [];

    // Check stock for each item
    for (const item of items) {
      // Basic validation
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid item',
          message: 'Each item must have a valid productId and a positive quantity'
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        notFoundItems.push({
          productId: item.productId,
          message: 'Product not found'
        });
        continue;
      }

      if (product.stock < item.quantity) {
        insufficientStockItems.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
      } else {
        validatedItems.push({
          ...item,
          productName: product.name,
          availableStock: product.stock
        });
      }
    }

    // Return error if any products not found
    if (notFoundItems.length > 0) {
      return res.status(404).json({
        error: 'Products not found',
        message: 'One or more products could not be found',
        items: notFoundItems
      });
    }

    // Return error if any items have insufficient stock
    if (insufficientStockItems.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: 'One or more items have insufficient stock',
        items: insufficientStockItems
      });
    }

    // All items have sufficient stock, proceed
    req.validatedItems = validatedItems;
    next();
  } catch (error) {
    console.error('Stock validation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error validating stock availability'
    });
  }
}; 