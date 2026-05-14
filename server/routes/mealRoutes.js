import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getMeals, addMeal, deleteMeal, getMealHistory } from '../controllers/mealController.js';

const router = express.Router();

router.get('/', authMiddleware, getMeals);
router.post('/', authMiddleware, addMeal);
router.delete('/:id', authMiddleware, deleteMeal);
router.get('/history', authMiddleware, getMealHistory);

export default router;
