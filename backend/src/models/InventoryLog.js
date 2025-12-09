import mongoose from 'mongoose';
import { INVENTORY_ACTION, INVENTORY_REASON } from '../config/constants.js';

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: [INVENTORY_ACTION.INCREASE, INVENTORY_ACTION.DECREASE],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  previousQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  newQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    enum: Object.values(INVENTORY_REASON),
    required: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ performedBy: 1 });

export const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

