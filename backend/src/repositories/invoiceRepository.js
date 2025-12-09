import { Invoice } from '../models/Invoice.js';

export class InvoiceRepository {
  static async create(invoiceData) {
    return await Invoice.create(invoiceData);
  }

  static async findById(id) {
    return await Invoice.findById(id)
      .populate('createdBy', 'username fullName')
      .populate('items.productId', 'name barcode');
  }

  static async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      startDate,
      endDate,
      status
    } = options;

    const filter = { ...query };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Invoice.find(filter)
        .populate('createdBy', 'username fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
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

  static async getTodayStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [totalRevenue, totalInvoices] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ]),
      Invoice.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      })
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalInvoices
    };
  }

  static async getRevenueByDateRange(startDate, endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  static async getBestSellingProducts(limit = 10, startDate, endDate) {
    const matchStage = {
      status: 'completed'
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    return await Invoice.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $sort: { totalQuantity: -1 }
      },
      { $limit: limit }
    ]);
  }
}

