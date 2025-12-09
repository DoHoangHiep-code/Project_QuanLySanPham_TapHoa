import { ProductRepository } from '../repositories/productRepository.js';
import { InventoryLogRepository } from '../repositories/inventoryLogRepository.js';
import { AppError } from '../middlewares/errorHandler.js';
import { INVENTORY_ACTION } from '../config/constants.js';

export class InventoryService {
  static async adjustInventory(productId, action, quantity, reason, performedBy, notes = '') {
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const previousQuantity = product.quantity;
    let newQuantity;

    if (action === INVENTORY_ACTION.INCREASE) {
      newQuantity = previousQuantity + quantity;
    } else if (action === INVENTORY_ACTION.DECREASE) {
      if (previousQuantity < quantity) {
        throw new AppError('Insufficient stock', 400);
      }
      newQuantity = previousQuantity - quantity;
    } else {
      throw new AppError('Invalid action', 400);
    }

    // Update product quantity
    await ProductRepository.updateQuantity(productId, newQuantity);

    // Create inventory log
    const log = await InventoryLogRepository.create({
      productId,
      productName: product.name,
      action,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      performedBy,
      notes
    });

    return {
      product: await ProductRepository.findById(productId),
      log
    };
  }

  static async getInventoryLogs(options = {}) {
    return await InventoryLogRepository.findAll({}, options);
  }

  static async getProductInventoryLogs(productId, limit = 50) {
    return await InventoryLogRepository.findByProductId(productId, limit);
  }
}

