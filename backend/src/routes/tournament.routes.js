import { Router } from 'express';
import {
    createTournament,
    getTournaments,
    getTournament,
    joinTournament,
    leaveTournament,
    updateTournamentStatus,
} from '../controllers/tournament.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getTournaments);
router.post('/', authenticate, createTournament);
router.get('/:id', getTournament);
router.post('/:id/join', authenticate, joinTournament);
router.delete('/:id/leave', authenticate, leaveTournament);
router.patch('/:id/status', authenticate, updateTournamentStatus);

export default router;
