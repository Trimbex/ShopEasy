import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
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