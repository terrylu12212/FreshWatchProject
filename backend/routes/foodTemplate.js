import express from 'express';
import { getFoodTemplates, createOrUpdateTemplate } from '../controllers/foodTemplateController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Require auth for all food template routes
router.use(requireAuth);

// GET /api/food-templates?search=milk
router.get('/', getFoodTemplates);

// POST /api/food-templates
router.post('/', createOrUpdateTemplate);

export default router;
