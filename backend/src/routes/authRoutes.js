import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authValidation } from '../utils/validation.js';

const router = express.Router();

router.post('/login', validate(authValidation.login), AuthController.login);
router.post('/refresh-token', validate(authValidation.refreshToken), AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), AuthController.forgotPassword);
router.get('/me', authenticate, AuthController.getMe);

export default router;

