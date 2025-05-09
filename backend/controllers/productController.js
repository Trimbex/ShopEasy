import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define a constant for low stock threshold
const LOW_STOCK_THRESHOLD = 5;

// Get all products
export const getProducts = async (req, res) => {
  try {
    // Only select fields that exist in the database
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        reviews: true
      }
    });

    // Add stock information to response
    const productsWithStockInfo = products.map(product => ({
      ...product,
      price: Number(product.price),
      stockStatus: {
        isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      }
    }));

    res.json(productsWithStockInfo);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: LOW_STOCK_THRESHOLD
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        reviews: true
      }
    });

    const formattedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
      stockStatus: {
        isLowStock: true,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      }
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Error fetching low stock products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Input validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a valid string'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `No product found with ID: ${id}`
      });
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0;

    // Format the response
    const formattedProduct = {
      ...product,
      price: Number(product.price),
      averageRating: Number(averageRating.toFixed(1)),
      stockStatus: {
        isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      },
      reviews: product.reviews.map(review => ({
        ...review,
        user: {
          id: review.user.id,
          name: review.user.name
        }
      }))
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching the product'
    });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock, category } = req.body;
    
    // Ensure price is a number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: numericPrice,
        imageUrl,
        stock: parseInt(stock) || 0,
        category
      }
    });
    
    res.status(201).json({
      ...product,
      price: Number(product.price),
      stockStatus: {
        isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, stock, category } = req.body;
    
    // Ensure price is a number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: numericPrice,
        imageUrl,
        stock: parseInt(stock) || 0,
        category
      }
    });
    
    res.json({
      ...product,
      price: Number(product.price),
      stockStatus: {
        isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
}; 