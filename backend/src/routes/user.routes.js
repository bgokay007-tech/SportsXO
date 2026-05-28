import { Router } from 'express';
import {
    getUserProfile,
    updateProfile,
    updateSkills,
    searchUsers,
    followUser,
    unfollowUser,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/:username', getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/skills', authenticate, updateSkills);
router.post('/:userId/follow', authenticate, followUser);
router.delete('/:userId/follow', authenticate, unfollowUser);

export default router;
