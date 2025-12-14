import express from 'express';
import { ExportController } from '../controllers/exportController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực và quyền admin
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/revenue', ExportController.exportRevenue);
router.get('/best-selling', ExportController.exportBestSelling);
router.get('/inventory', ExportController.exportInventory);

export default router;

