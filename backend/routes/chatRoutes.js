import express from 'express';
import * as chatController from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, chatController.chat);

export default router;