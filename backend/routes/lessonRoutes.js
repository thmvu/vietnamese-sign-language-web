const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);

router.post('/', authMiddleware, checkRole('admin'), lessonController.createLesson);
router.put('/:id', authMiddleware, checkRole('admin'), lessonController.updateLesson);
router.delete('/:id', authMiddleware, checkRole('admin'), lessonController.deleteLesson);

module.exports = router;