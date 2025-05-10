import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';
import { validateStockAvailability } from '../middleware/stockValidation.js';

const router = express.Router();

// GET /api/orders - Get all orders (admin only)
router.get('/', authenticate, adminOnly, getOrders);

// GET /api/orders/user - Get current user's orders
router.get('/user', authenticate, getUserOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticate, getOrder);

// POST /api/orders/validate-stock - Validate stock without creating an order
router.post('/validate-stock', authenticate, validateStockAvailability, (req, res) => {
  // If we reach here, validation passed
  res.status(200).json({ 
    success: true, 
    message: 'All items have sufficient stock',
    items: req.validatedItems 
  });
});

// POST /api/orders - Create new order
router.post('/', authenticate, validateStockAvailability, createOrder);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticate, adminOnly, updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order (user can cancel their own orders)
router.put('/:id/cancel', authenticate, cancelOrder);

export default router; 