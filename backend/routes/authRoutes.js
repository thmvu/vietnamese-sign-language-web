import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);

// Admin only - Users
router.get('/users', authMiddleware, checkRole('admin'), authController.getAllUsers);
router.post('/users', authMiddleware, checkRole('admin'), authController.createUser);
router.put('/users/:id', authMiddleware, checkRole('admin'), authController.updateUser);
router.delete('/users/:id', authMiddleware, checkRole('admin'), authController.deleteUser);

export default router;