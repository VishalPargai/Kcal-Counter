import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCustomFoods, createCustomFood } from '../controllers/customFoodController.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getCustomFoods);
router.post('/', createCustomFood);

export default router;
