import express from 'express';
import { InvoiceController } from '../controllers/invoiceController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { invoiceValidation, queryValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(invoiceValidation.create), InvoiceController.createInvoice);
router.get('/', validateQuery(queryValidation.pagination), InvoiceController.getAllInvoices);
router.put('/:id/status', validate(invoiceValidation.updateStatus), InvoiceController.updateInvoiceStatus);
router.get('/stats/today', InvoiceController.getTodayStats);
router.get('/stats/revenue', InvoiceController.getRevenueByDateRange);
router.get('/stats/best-selling', InvoiceController.getBestSellingProducts);
router.get('/:id', InvoiceController.getInvoiceById);

export default router;

