const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/evaluate', authMiddleware, practiceController.evaluatePractice);

module.exports = router;