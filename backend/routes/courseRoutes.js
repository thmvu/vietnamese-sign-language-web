import express from 'express';
import * as courseController from '../controllers/courseController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:courseId/lessons', courseController.getLessonsByCourse);

// Admin-only routes
router.post('/', authMiddleware, checkRole('admin'), courseController.createCourse);
router.put('/:id', authMiddleware, checkRole('admin'), courseController.updateCourse);
router.delete('/:id', authMiddleware, checkRole('admin'), courseController.deleteCourse);

// User routes
router.post('/:id/complete', authMiddleware, courseController.completeCourse);
router.get('/:id/completion', authMiddleware, courseController.getCourseCompletionStatus);

export default router;
