import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define a constant for low stock threshold
const LOW_STOCK_THRESHOLD = 5;

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, minRating } = req.query;

    // Build the query options
    const queryOptions = {
      where: {},
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
          }
        }
      }
    };
    
    // Add category filter if provided
    if (category) {
      queryOptions.where = {
        ...queryOptions.where,
        category
      };
    }
    
    // Get products with the specified filters
    const products = await prisma.product.findMany(queryOptions);

    // Format products with calculated average ratings
    const formattedProducts = products.map(product => {
      // Calculate average rating
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        price: Number(product.price),
        averageRating: Number(averageRating.toFixed(1))
      };
    });

    // Add stock information to response
    const productsWithStockInfo = formattedProducts.map(product => ({
      ...product,
      stockStatus: {
        isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD
      }
    }));

    // Filter by minimum rating if specified
    let filteredProducts = productsWithStockInfo;
    if (minRating && !isNaN(Number(minRating))) {
      const minRatingValue = Number(minRating);
      filteredProducts = filteredProducts.filter(product =>
        product.averageRating >= minRatingValue
      );
    }

    res.json(filteredProducts);

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
    
    // Input validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Valid product description is required' });
    }
    
    // Ensure price is a valid positive number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    
    // Validate imageUrl is a proper URL
    if (!imageUrl || typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
      return res.status(400).json({ error: 'Valid image URL is required' });
    }
    
    // Validate stock is a non-negative integer
    const numericStock = parseInt(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ error: 'Stock must be a valid non-negative integer' });
    }
    
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Product category is required' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        imageUrl,
        stock: numericStock,
        category: category.trim()
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
    res.status(500).json({ 
      error: 'Error creating product',
      message: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, stock, category } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `No product found with ID: ${id}`
      });
    }
    
    // Prepare update data with validation
    const updateData = {};
    
    // Only update fields that are provided and valid
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Product name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Product description must be a string' });
      }
      updateData.description = description.trim();
    }
    
    if (price !== undefined) {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a valid positive number' });
      }
      updateData.price = numericPrice;
    }
    
    if (imageUrl !== undefined) {
      if (typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
        return res.status(400).json({ error: 'Valid image URL is required' });
      }
      updateData.imageUrl = imageUrl;
    }
    
    if (stock !== undefined) {
      const numericStock = parseInt(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: 'Stock must be a valid non-negative integer' });
      }
      updateData.stock = numericStock;
    }
    
    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return res.status(400).json({ error: 'Product category cannot be empty' });
      }
      updateData.category = category.trim();
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
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
    
    // Handle Prisma client known errors
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'The requested product does not exist or was already deleted'
      });
    }
    
    res.status(500).json({ 
      error: 'Error updating product',
      message: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a valid string'
      });
    }
    
    // Check if product exists before deleting
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `No product found with ID: ${id}`
      });
    }
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Product successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    // Handle Prisma client known errors
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'The requested product does not exist or was already deleted'
      });
    }
    
    res.status(500).json({ 
      error: 'Error deleting product',
      message: error.message 
    });
  }
};

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
} 