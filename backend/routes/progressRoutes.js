import express from 'express';
import * as progressController from '../controllers/progressController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/save', authMiddleware, progressController.saveProgress);
router.get('/me', authMiddleware, progressController.getMyProgress);

router.get('/all', authMiddleware, checkRole('admin'), progressController.getAllProgress);
router.get('/user/:userId', authMiddleware, checkRole('admin'), progressController.getUserProgress);

export default router;