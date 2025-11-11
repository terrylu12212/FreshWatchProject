import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', getAnalytics);

export default router;
