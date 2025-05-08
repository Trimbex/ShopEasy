import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();

    // Fetch products from DummyJSON
    console.log('Fetching products from DummyJSON...');
    const response = await fetch('https://dummyjson.com/products?limit=100');
    const data = await response.json();
    const products = data.products;

    // Create products in database
    console.log('Creating products in database...');
    const createdProducts = await Promise.all(
      products.map(product =>
        prisma.product.create({
          data: {
            name: product.title,
            description: product.description,
            price: product.price,
            imageUrl: product.images[0],
            stock: product.stock,
            category: product.category,
          },
        })
      )
    );

    console.log(`Successfully created ${createdProducts.length} products`);
    console.log('Sample product:', createdProducts[0]);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 