import express from 'express';
import * as quizController from '../controllers/quizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/:lessonId', authMiddleware, quizController.getQuizzesByLesson);
router.post('/:lessonId/submit', authMiddleware, quizController.submitQuiz);

// Admin: Create quiz for a lesson
router.post('/:lessonId', authMiddleware, checkRole('admin'), quizController.createQuiz);
// Also support POST / with lesson_id in body
router.post('/', authMiddleware, checkRole('admin'), quizController.createQuiz);
router.put('/:id', authMiddleware, checkRole('admin'), quizController.updateQuiz);
router.delete('/:id', authMiddleware, checkRole('admin'), quizController.deleteQuiz);

export default router;