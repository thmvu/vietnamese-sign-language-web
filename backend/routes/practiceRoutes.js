import express from 'express';
import * as practiceController from '../controllers/practiceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/evaluate', authMiddleware, practiceController.evaluatePractice);

export default router;