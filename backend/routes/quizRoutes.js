import express from 'express';
import * as quizController from '../controllers/quizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/:lessonId', authMiddleware, quizController.getQuizzesByLesson);
router.post('/:lessonId/submit', authMiddleware, quizController.submitQuiz);

router.post('/', authMiddleware, checkRole('admin'), quizController.createQuiz);
router.put('/:id', authMiddleware, checkRole('admin'), quizController.updateQuiz);
router.delete('/:id', authMiddleware, checkRole('admin'), quizController.deleteQuiz);

export default router;