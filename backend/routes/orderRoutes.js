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

const router = express.Router();

// GET /api/orders - Get all orders (admin only)
router.get('/', authenticate, adminOnly, getOrders);

// GET /api/orders/myorders - Get logged in user's orders
router.get('/myorders', authenticate, getUserOrders);

// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, getOrder);

// POST /api/orders - Create new order
router.post('/', authenticate, createOrder);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticate, adminOnly, updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order (user can cancel their own orders)
router.put('/:id/cancel', authenticate, cancelOrder);

export default router; 