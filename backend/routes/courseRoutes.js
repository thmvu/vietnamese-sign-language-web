import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:courseId/lessons', courseController.getLessonsByCourse);

export default router;
