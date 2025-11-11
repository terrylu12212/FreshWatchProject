import express from 'express';
import { listItems, deleteItem, createItem, updateItem, consumeItem } from '../controllers/itemsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.put('/:id/consume', consumeItem);
router.delete('/:id', deleteItem);

export default router;
