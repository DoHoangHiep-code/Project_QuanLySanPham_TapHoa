import { DashboardService } from '../services/dashboardService.js';

export class DashboardController {
  static async getDashboardStats(req, res, next) {
    try {
      const stats = await DashboardService.getDashboardStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

