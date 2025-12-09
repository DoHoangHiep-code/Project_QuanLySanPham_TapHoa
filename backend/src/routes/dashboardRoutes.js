import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', DashboardController.getDashboardStats);

export default router;

