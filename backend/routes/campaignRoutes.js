import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getActiveCampaigns
} from '../controllers/campaignController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for active campaigns (used in hero section)
router.get('/active', getActiveCampaigns);

// Admin routes - require authentication and admin privileges
router.get('/', authenticate, adminOnly, getCampaigns);
router.get('/:id', authenticate, adminOnly, getCampaignById);
router.post('/', authenticate, adminOnly, createCampaign);
router.put('/:id', authenticate, adminOnly, updateCampaign);
router.delete('/:id', authenticate, adminOnly, deleteCampaign);

export default router; 