const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.post('/save', authMiddleware, progressController.saveProgress);
router.get('/me', authMiddleware, progressController.getMyProgress);

router.get('/all', authMiddleware, checkRole('admin'), progressController.getAllProgress);
router.get('/user/:userId', authMiddleware, checkRole('admin'), progressController.getUserProgress);

module.exports = router;