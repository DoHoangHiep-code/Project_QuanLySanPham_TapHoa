import { ExportService } from '../services/exportService.js';

export class ExportController {
  /**
   * Xuất báo cáo doanh thu
   */
  static async exportRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }

      const csv = await ExportService.exportRevenueReport(startDate, endDate);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="bao-cao-doanh-thu-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo hàng bán chạy
   */
  static async exportBestSelling(req, res, next) {
    try {
      const { startDate, endDate, limit } = req.query;
      const csv = await ExportService.exportBestSellingReport(startDate, endDate, parseInt(limit) || 100);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="bao-cao-hang-ban-chay-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo tồn kho
   */
  static async exportInventory(req, res, next) {
    try {
      const csv = await ExportService.exportInventoryReport();

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="bao-cao-ton-kho-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

