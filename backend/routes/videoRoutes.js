import express from 'express';
import * as videoController from '../controllers/videoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/lesson/:lessonId', videoController.getVideosByLesson);

router.post('/', authMiddleware, checkRole('admin'), videoController.createVideo);
router.put('/:id', authMiddleware, checkRole('admin'), videoController.updateVideo);
router.delete('/:id', authMiddleware, checkRole('admin'), videoController.deleteVideo);

export default router;