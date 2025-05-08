import express from 'express';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication and admin-only middlewares to all routes
router.use(authenticate, adminOnly);

// Admin Dashboard - Get stats
router.get('/dashboard', (req, res) => {
  // This is just a placeholder - in a real application we would fetch data from the database
  res.json({
    message: 'Admin dashboard data',
    stats: {
      totalUsers: 100,
      totalOrders: 250,
      totalProducts: 50,
      recentOrders: 15
    }
  });
});

// Simple admin check endpoint
router.get('/check', (req, res) => {
  res.json({
    message: 'You have admin access',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

export default router; 