import { InvoiceRepository } from '../repositories/invoiceRepository.js';
import { ProductRepository } from '../repositories/productRepository.js';

export class ExportService {
  /**
   * Xuất báo cáo doanh thu ra file CSV
   */
  static async exportRevenueReport(startDate, endDate) {
    const revenueData = await InvoiceRepository.getRevenueByDateRange(startDate, endDate);

    // Tính tổng
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalInvoices = revenueData.reduce((sum, item) => sum + item.count, 0);

    // Tạo file CSV
    let csv = '\uFEFF'; // BOM cho UTF-8
    csv += 'BÁO CÁO DOANH THU\n';
    csv += `Từ ngày: ${new Date(startDate).toLocaleDateString('vi-VN')}\n`;
    csv += `Đến ngày: ${new Date(endDate).toLocaleDateString('vi-VN')}\n\n`;
    csv += 'Ngày,Doanh thu (VNĐ),Số hóa đơn\n';

    revenueData.forEach(item => {
      // Định dạng ngày cho Excel (DD/MM/YYYY)
      const dateParts = item._id.split('-');
      const formattedDate = dateParts.length === 3 
        ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
        : item._id;
      const revenue = new Intl.NumberFormat('vi-VN').format(item.revenue);
      csv += `${item._id},${revenue},${item.count}\n`;
    });

    csv += `\nTỔNG CỘNG,${new Intl.NumberFormat('vi-VN').format(totalRevenue)},${totalInvoices}\n`;

    return csv;
  }

  /**
   * Xuất báo cáo hàng bán chạy ra file CSV
   */
  static async exportBestSellingReport(startDate, endDate, limit = 100) {
    const bestSelling = await InvoiceRepository.getBestSellingProducts(limit, startDate, endDate);

    // Tạo file CSV
    let csv = '\uFEFF'; // BOM cho UTF-8
    csv += 'BÁO CÁO HÀNG BÁN CHẠY\n';
    if (startDate && endDate) {
      csv += `Từ ngày: ${new Date(startDate).toLocaleDateString('vi-VN')}\n`;
      csv += `Đến ngày: ${new Date(endDate).toLocaleDateString('vi-VN')}\n`;
    } else {
      csv += 'Tất cả thời gian\n';
    }
    csv += '\n';
    csv += 'STT,Tên sản phẩm,Số lượng bán,Doanh thu (VNĐ)\n';

    bestSelling.forEach((item, index) => {
      const revenue = new Intl.NumberFormat('vi-VN').format(item.totalRevenue);
      csv += `${index + 1},"${item.productName}",${item.totalQuantity},${revenue}\n`;
    });

    return csv;
  }

  /**
   * Xuất báo cáo tồn kho ra file CSV
   */
  static async exportInventoryReport() {
    const products = await ProductRepository.findAll(
      { isActive: true },
      { limit: 10000, sort: '-quantity' }
    );

    // Tạo file CSV
    let csv = '\uFEFF'; // BOM cho UTF-8
    csv += 'BÁO CÁO TỒN KHO\n';
    csv += `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
    csv += 'STT,Tên sản phẩm,Danh mục,Số lượng,Đơn vị,Giá bán (VNĐ),Giá nhập (VNĐ),Trạng thái\n';

    products.data.forEach((product, index) => {
      const price = new Intl.NumberFormat('vi-VN').format(product.price);
      const importPrice = new Intl.NumberFormat('vi-VN').format(product.importPrice);
      const status = product.quantity <= (product.lowStockThreshold || 10) ? 'Sắp hết' : 'Đủ hàng';
      const categoryName = (product.categoryId && product.categoryId.name) ? product.categoryId.name : 'N/A';
      
      csv += `${index + 1},"${product.name}","${categoryName}",${product.quantity},${product.unit},${price},${importPrice},${status}\n`;
    });

    return csv;
  }
}

