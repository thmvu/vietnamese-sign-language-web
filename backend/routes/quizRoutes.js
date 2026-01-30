import express from 'express';
import * as quizController from '../controllers/quizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/:lessonId', authMiddleware, quizController.getQuizzesByLesson);
router.post('/:lessonId/submit', authMiddleware, quizController.submitQuiz);

// --- Admin Quiz Sets ---
router.get('/sets/all', authMiddleware, checkRole('admin'), quizController.getAllQuizSets);
router.post('/sets', authMiddleware, checkRole('admin'), quizController.createQuizSet);
router.put('/sets/:id', authMiddleware, checkRole('admin'), quizController.updateQuizSet);
router.delete('/sets/:id', authMiddleware, checkRole('admin'), quizController.deleteQuizSet);

// --- Admin Questions (Bulk) ---
router.get('/set/:setId/questions', authMiddleware, quizController.getQuizzesBySet);
router.put('/set/:setId/questions', authMiddleware, checkRole('admin'), quizController.bulkUpdateQuizzes);

// Also support POST / with lesson_id in body
router.post('/', authMiddleware, checkRole('admin'), quizController.createQuiz);
router.put('/:id', authMiddleware, checkRole('admin'), quizController.updateQuiz);
router.delete('/:id', authMiddleware, checkRole('admin'), quizController.deleteQuiz);

export default router;