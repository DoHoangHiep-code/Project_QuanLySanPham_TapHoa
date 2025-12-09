import express from 'express';
import { ExportController } from '../controllers/exportController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực
router.use(authenticate);

router.get('/revenue', ExportController.exportRevenue);
router.get('/best-selling', ExportController.exportBestSelling);
router.get('/inventory', ExportController.exportInventory);

export default router;

