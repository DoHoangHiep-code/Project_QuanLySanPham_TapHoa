import { InventoryService } from '../services/inventoryService.js';
import { INVENTORY_ACTION } from '../config/constants.js';

export class InventoryController {
  static async adjustInventory(req, res, next) {
    try {
      const { productId, action, quantity, reason, notes } = req.body;
      const performedBy = req.user._id;

      const result = await InventoryService.adjustInventory(
        productId,
        action,
        quantity,
        reason,
        performedBy,
        notes
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryLogs(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-createdAt',
        productId: req.query.productId,
        action: req.query.action,
        reason: req.query.reason,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await InventoryService.getInventoryLogs(options);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductInventoryLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const logs = await InventoryService.getProductInventoryLogs(req.params.productId, limit);
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

