import express from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { inventoryValidation, queryValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/adjust', validate(inventoryValidation.adjust), InventoryController.adjustInventory);
router.get('/logs', validateQuery(queryValidation.pagination), InventoryController.getInventoryLogs);
router.get('/logs/product/:productId', InventoryController.getProductInventoryLogs);

export default router;

