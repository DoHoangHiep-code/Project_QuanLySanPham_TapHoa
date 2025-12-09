import { InventoryLog } from '../models/InventoryLog.js';

export class InventoryLogRepository {
  static async create(logData) {
    return await InventoryLog.create(logData);
  }

  static async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      productId,
      action,
      reason,
      startDate,
      endDate
    } = options;

    const filter = { ...query };

    if (productId) filter.productId = productId;
    if (action) filter.action = action;
    if (reason) filter.reason = reason;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      InventoryLog.find(filter)
        .populate('productId', 'name barcode')
        .populate('performedBy', 'username fullName')
        .populate('invoiceId', 'invoiceNumber')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      InventoryLog.countDocuments(filter)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async findByProductId(productId, limit = 50) {
    return await InventoryLog.find({ productId })
      .populate('performedBy', 'username fullName')
      .sort('-createdAt')
      .limit(limit);
  }
}

