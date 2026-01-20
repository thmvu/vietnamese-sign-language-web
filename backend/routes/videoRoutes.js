const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.get('/lesson/:lessonId', videoController.getVideosByLesson);

router.post('/', authMiddleware, checkRole('admin'), videoController.createVideo);
router.put('/:id', authMiddleware, checkRole('admin'), videoController.updateVideo);
router.delete('/:id', authMiddleware, checkRole('admin'), videoController.deleteVideo);

module.exports = router;