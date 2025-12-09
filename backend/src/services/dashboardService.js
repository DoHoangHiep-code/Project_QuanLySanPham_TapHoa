import { InvoiceRepository } from '../repositories/invoiceRepository.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { InvoiceService } from './invoiceService.js';

export class DashboardService {
  static async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const todayStats = await InvoiceRepository.getTodayStats();

    // Low stock products
    const lowStockProducts = await ProductRepository.findLowStock(10);

    // Revenue for last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const revenueLast7Days = await InvoiceRepository.getRevenueByDateRange(
      sevenDaysAgo.toISOString(),
      today.toISOString()
    );

    // Format revenue data for chart
    const revenueChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = revenueLast7Days.find(r => r._id === dateStr);
      revenueChartData.push({
        date: dateStr,
        revenue: dayData?.revenue || 0,
        count: dayData?.count || 0
      });
    }

    return {
      todayStats,
      lowStockProducts: lowStockProducts.slice(0, 10),
      revenueLast7Days: revenueChartData
    };
  }
}

