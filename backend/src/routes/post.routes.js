import { Router } from 'express';
import {
    createPost,
    getFeed,
    getPost,
    deletePost,
    toggleLike,
    addComment,
    getUserPosts,
} from '../controllers/post.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/feed', authenticate, getFeed);
router.post('/', authenticate, createPost);
router.get('/:id', authenticate, getPost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/comment', authenticate, addComment);
router.get('/user/:username', getUserPosts);

export default router;
