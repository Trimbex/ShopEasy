import express from 'express';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

// Apply authentication and admin-only middlewares to all routes
router.use(authenticate, adminOnly);

// Admin Dashboard - Get stats
router.get('/dashboard', getDashboardStats);

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