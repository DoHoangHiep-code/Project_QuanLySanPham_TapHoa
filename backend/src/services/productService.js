import { ProductRepository } from '../repositories/productRepository.js';
import { CategoryRepository } from '../repositories/categoryRepository.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ProductService {
  static async createProduct(data) {
    // Kiểm tra danh mục tồn tại
    const category = await CategoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Kiểm tra mã vạch duy nhất nếu được cung cấp
    if (data.barcode) {
      const existing = await ProductRepository.findByBarcode(data.barcode);
      if (existing) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    return await ProductRepository.create(data);
  }

  static async getAllProducts(options = {}) {
    const result = await ProductRepository.findAll({ isActive: true }, options);
    
    // Thêm cờ isLowStock cho mỗi sản phẩm
    result.data = result.data.map(product => ({
      ...product,
      isLowStock: product.quantity <= (product.lowStockThreshold || 10),
      profit: product.price - product.importPrice
    }));

    return result;
  }

  static async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const productObj = product.toObject ? product.toObject() : product;
    return {
      ...productObj,
      isLowStock: productObj.quantity <= (productObj.lowStockThreshold || 10),
      profit: productObj.price - productObj.importPrice
    };
  }

  static async updateProduct(id, data) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Kiểm tra danh mục nếu đang được cập nhật
    if (data.categoryId) {
      const category = await CategoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Kiểm tra mã vạch duy nhất nếu đang được cập nhật
    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await ProductRepository.findByBarcode(data.barcode);
      if (existing) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    return await ProductRepository.update(id, data);
  }

  static async deleteProduct(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Xóa mềm
    await ProductRepository.update(id, { isActive: false });
    return { message: 'Product deleted successfully' };
  }

  static async getLowStockProducts(threshold = 10) {
    return await ProductRepository.findLowStock(threshold);
  }
}

