import express from 'express';
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/couponController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Apply coupon (user must be authenticated)
router.post('/apply', authenticate, applyCoupon);

// Admin: CRUD
router.get('/', authenticate, adminOnly, getCoupons);
router.get('/:id', authenticate, adminOnly, getCouponById);
router.post('/', authenticate, adminOnly, createCoupon);
router.put('/:id', authenticate, adminOnly, updateCoupon);
router.delete('/:id', authenticate, adminOnly, deleteCoupon);

export default router; 