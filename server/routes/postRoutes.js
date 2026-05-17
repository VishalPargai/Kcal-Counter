import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { getPosts, createPost, toggleLike, addComment, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.get('/', auth, getPosts);
router.post('/', auth, createPost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.delete('/:id', auth, deletePost);

export default router;
