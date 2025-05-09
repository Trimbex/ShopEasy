import express from 'express';
import {
  getCouponMetrics,
  getCampaignMetrics,
  getOverviewMetrics
} from '../controllers/telemetryController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/coupons', authenticate, adminOnly, getCouponMetrics);
router.get('/campaigns', authenticate, adminOnly, getCampaignMetrics);
router.get('/overview', authenticate, adminOnly, getOverviewMetrics);

export default router; 