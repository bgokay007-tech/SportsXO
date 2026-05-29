import { Router } from 'express';
import {
    sendMatchRequest,
    getIncomingRequests,
    getOutgoingRequests,
    respondToRequest,
    deleteRequest,
    findPlayers,
} from '../controllers/match.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/find-players', authenticate, findPlayers);
router.get('/incoming', authenticate, getIncomingRequests);
router.get('/outgoing', authenticate, getOutgoingRequests);
router.post('/', authenticate, sendMatchRequest);
router.patch('/:id/respond', authenticate, respondToRequest);
router.delete('/:id', authenticate, deleteRequest);

export default router;