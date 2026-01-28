import express from 'express';
import * as lessonController from '../controllers/lessonController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);

router.post('/', authMiddleware, checkRole('admin'), lessonController.createLesson);
router.put('/:id', authMiddleware, checkRole('admin'), lessonController.updateLesson);
router.delete('/:id', authMiddleware, checkRole('admin'), lessonController.deleteLesson);

export default router;