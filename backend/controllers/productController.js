import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, minRating } = req.query;
    
    // Build the query options
    const queryOptions = {
      include: {
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
    
    // Filter by minimum rating if specified
    let filteredProducts = formattedProducts;
    if (minRating && !isNaN(Number(minRating))) {
      const minRatingValue = Number(minRating);
      filteredProducts = formattedProducts.filter(product => 
        product.averageRating >= minRatingValue
      );
    }
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
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
      include: {
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
    
    res.status(201).json(product);
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
    
    res.json(product);
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