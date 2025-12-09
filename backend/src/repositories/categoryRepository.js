import { Category } from '../models/Category.js';

export class CategoryRepository {
  static async create(categoryData) {
    return await Category.create(categoryData);
  }

  static async findById(id) {
    return await Category.findById(id);
  }

  static async findAll(query = {}) {
    return await Category.find(query).sort({ name: 1 });
  }

  static async update(id, updateData) {
    return await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  static async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  static async findByName(name) {
    return await Category.findOne({ name });
  }
}

