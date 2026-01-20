const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.get('/:lessonId', authMiddleware, quizController.getQuizzesByLesson);

router.post('/', authMiddleware, checkRole('admin'), quizController.createQuiz);
router.put('/:id', authMiddleware, checkRole('admin'), quizController.updateQuiz);
router.delete('/:id', authMiddleware, checkRole('admin'), quizController.deleteQuiz);

module.exports = router;