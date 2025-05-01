import express from 'express';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Protected routes (basic structure)
router.get('/profile', authenticateToken, (req, res) => {
    // Implementation coming later
});

router.put('/profile', authenticateToken, (req, res) => {
    // Implementation coming later
});

router.delete('/profile', authenticateToken, (req, res) => {
    // Implementation coming later
});

export default router;