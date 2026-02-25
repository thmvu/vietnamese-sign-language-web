import express from 'express';
import * as practiceController from '../controllers/practiceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Kiểm tra AI Service có đang chạy không (public, không cần đăng nhập)
router.get('/health', practiceController.checkAiHealth);

// Gửi landmarks → AI nhận diện (cần đăng nhập)
router.post('/evaluate', authMiddleware, practiceController.evaluatePractice);

export default router;