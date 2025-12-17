import Joi from 'joi';
import { ROLES, INVENTORY_ACTION, INVENTORY_REASON, PAGINATION } from '../config/constants.js';

// Auth Validation
export const authValidation = {
  login: Joi.object({
    username: Joi.string().required().trim(),
    password: Joi.string().required().min(6)
  }),
  
  register: Joi.object({
    username: Joi.string().required().min(3).max(50).trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(6),
    fullName: Joi.string().required().trim(),
    role: Joi.string().valid(ROLES.ADMIN, ROLES.STAFF).default(ROLES.STAFF)
  }),
  
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().required().trim().lowercase()
  })
};

// Category Validation
export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().required().trim(),
    description: Joi.string().trim().allow('').default('')
  }),
  
  update: Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().trim().allow(''),
    isActive: Joi.boolean()
  })
};

// Product Validation
export const productValidation = {
  create: Joi.object({
    name: Joi.string().required().trim(),
    price: Joi.number().required().min(0),
    importPrice: Joi.number().required().min(0),
    quantity: Joi.number().min(0).default(0),
    unit: Joi.string().trim().default('cái'),
    categoryId: Joi.string().required(),
    barcode: Joi.string().trim().allow(null, ''),
    image: Joi.string().uri().allow(null, ''),
    lowStockThreshold: Joi.number().min(0).default(10)
  }),
  
  update: Joi.object({
    name: Joi.string().trim(),
    price: Joi.number().min(0),
    importPrice: Joi.number().min(0),
    quantity: Joi.number().min(0),
    unit: Joi.string().trim(),
    categoryId: Joi.string(),
    barcode: Joi.string().trim().allow(null, ''),
    image: Joi.string().uri().allow(null, ''),
    lowStockThreshold: Joi.number().min(0),
    isActive: Joi.boolean()
  })
};

// Inventory Validation
export const inventoryValidation = {
  adjust: Joi.object({
    productId: Joi.string().required(),
    action: Joi.string().valid(INVENTORY_ACTION.INCREASE, INVENTORY_ACTION.DECREASE).required(),
    quantity: Joi.number().required().min(1),
    reason: Joi.string().valid(...Object.values(INVENTORY_REASON)).required(),
    notes: Joi.string().trim().allow('').default('')
  })
};

// Invoice Validation
export const invoiceValidation = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required().min(1)
      })
    ).min(1).required(),
    customerName: Joi.string().trim().default('Khách lẻ'),
    customerPhone: Joi.string().trim().allow(null, ''),
    notes: Joi.string().trim().allow('').default('')
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('completed', 'cancelled', 'refunded').required()
  })
};

// Query Validation
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().trim().allow(''),

    // Common filters (used by multiple endpoints). These must be declared here because validateQuery strips unknown keys.
    categoryId: Joi.string().trim(),
    isLowStock: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')),

    productId: Joi.string().trim(),
    action: Joi.string().valid(INVENTORY_ACTION.INCREASE, INVENTORY_ACTION.DECREASE),
    reason: Joi.string().valid(...Object.values(INVENTORY_REASON)),

    startDate: Joi.string().trim(),
    endDate: Joi.string().trim(),

    status: Joi.string().valid('completed', 'cancelled', 'refunded')
  })
};

