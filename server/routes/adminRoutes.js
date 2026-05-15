import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { getAllUsers, getUserDetails, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);

export default router;
