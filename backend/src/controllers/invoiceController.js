import { InvoiceService } from '../services/invoiceService.js';

export class InvoiceController {
  static async createInvoice(req, res, next) {
    try {
      const invoice = await InvoiceService.createInvoice(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllInvoices(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-createdAt',
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status
      };

      const result = await InvoiceService.getAllInvoices(options);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTodayStats(req, res, next) {
    try {
      const stats = await InvoiceService.getTodayStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: { message: 'startDate and endDate are required' }
        });
      }

      const revenue = await InvoiceService.getRevenueByDateRange(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBestSellingProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const { startDate, endDate } = req.query;

      const products = await InvoiceService.getBestSellingProducts(limit, startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoiceStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await InvoiceService.updateInvoiceStatus(req.params.id, status);

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

