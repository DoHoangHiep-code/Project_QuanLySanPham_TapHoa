import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { productValidation, queryValidation } from '../utils/validation.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validateQuery(queryValidation.pagination), ProductController.getAllProducts);
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', authorize(ROLES.ADMIN), validate(productValidation.create), ProductController.createProduct);
router.put('/:id', authorize(ROLES.ADMIN), validate(productValidation.update), ProductController.updateProduct);
router.delete('/:id', authorize(ROLES.ADMIN), ProductController.deleteProduct);

export default router;

