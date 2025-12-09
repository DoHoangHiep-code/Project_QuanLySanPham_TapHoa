import { InvoiceRepository } from '../repositories/invoiceRepository.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { InventoryLogRepository } from '../repositories/inventoryLogRepository.js';
import { AppError } from '../middlewares/errorHandler.js';
import { INVENTORY_ACTION, INVENTORY_REASON } from '../config/constants.js';

export class InvoiceService {
  static async createInvoice(data, createdBy) {
    const { items, customerName, customerPhone, notes } = data;

    // Validate and prepare items
    const invoiceItems = [];
    let subtotal = 0;
    let totalProfit = 0;

    for (const item of items) {
      const product = await ProductRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404);
      }

      if (!product.isActive) {
        throw new AppError(`Product ${product.name} is not active`, 400);
      }

      if (product.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.quantity}`, 400);
      }

      const itemSubtotal = product.price * item.quantity;
      const itemProfit = (product.price - product.importPrice) * item.quantity;

      invoiceItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        importPrice: product.importPrice,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
      totalProfit += itemProfit;
    }

    // Create invoice
    const invoice = await InvoiceRepository.create({
      items: invoiceItems,
      subtotal,
      total: subtotal,
      profit: totalProfit,
      customerName: customerName || 'Khách lẻ',
      customerPhone: customerPhone || null,
      createdBy,
      notes: notes || '',
      status: 'completed'
    });

    // Update product quantities and create inventory logs
    for (const item of invoiceItems) {
      const product = await ProductRepository.findById(item.productId);
      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity - item.quantity;

      await ProductRepository.updateQuantity(item.productId, newQuantity);

      await InventoryLogRepository.create({
        productId: item.productId,
        productName: item.productName,
        action: INVENTORY_ACTION.DECREASE,
        quantity: item.quantity,
        previousQuantity,
        newQuantity,
        reason: INVENTORY_REASON.SALE,
        invoiceId: invoice._id,
        performedBy: createdBy,
        notes: `Invoice: ${invoice.invoiceNumber}`
      });
    }

    return await InvoiceRepository.findById(invoice._id);
  }

  static async getAllInvoices(options = {}) {
    return await InvoiceRepository.findAll({}, options);
  }

  static async getInvoiceById(id) {
    const invoice = await InvoiceRepository.findById(id);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }
    return invoice;
  }

  static async getTodayStats() {
    return await InvoiceRepository.getTodayStats();
  }

  static async getRevenueByDateRange(startDate, endDate) {
    return await InvoiceRepository.getRevenueByDateRange(startDate, endDate);
  }

  static async getBestSellingProducts(limit = 10, startDate, endDate) {
    return await InvoiceRepository.getBestSellingProducts(limit, startDate, endDate);
  }
}

