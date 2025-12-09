import { CategoryRepository } from '../repositories/categoryRepository.js';
import { AppError } from '../middlewares/errorHandler.js';

export class CategoryService {
  static async createCategory(data) {
    // Check if category name already exists
    const existing = await CategoryRepository.findByName(data.name);
    if (existing) {
      throw new AppError('Category name already exists', 400);
    }

    return await CategoryRepository.create(data);
  }

  static async getAllCategories() {
    return await CategoryRepository.findAll({ isActive: true });
  }

  static async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  static async updateCategory(id, data) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name !== category.name) {
      const existing = await CategoryRepository.findByName(data.name);
      if (existing) {
        throw new AppError('Category name already exists', 400);
      }
    }

    return await CategoryRepository.update(id, data);
  }

  static async deleteCategory(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has products
    const { Product } = await import('../models/Product.js');
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      throw new AppError('Cannot delete category with existing products', 400);
    }

    await CategoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
}

