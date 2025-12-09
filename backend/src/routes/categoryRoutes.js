import express from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { categoryValidation } from '../utils/validation.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', authorize(ROLES.ADMIN), validate(categoryValidation.create), CategoryController.createCategory);
router.put('/:id', authorize(ROLES.ADMIN), validate(categoryValidation.update), CategoryController.updateCategory);
router.delete('/:id', authorize(ROLES.ADMIN), CategoryController.deleteCategory);

export default router;

