import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reviews/products/:productId - Get all reviews for a product
router.get('/products/:productId', getProductReviews);

// POST /api/reviews - Create a new review (requires authentication)
router.post('/', authenticate, createReview);

// PUT /api/reviews/:id - Update a review (requires authentication)
router.put('/:id', authenticate, updateReview);

// DELETE /api/reviews/:id - Delete a review (requires authentication)
router.delete('/:id', authenticate, deleteReview);

export default router; 