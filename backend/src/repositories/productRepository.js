import { Product } from '../models/Product.js';

export class ProductRepository {
  static async create(productData) {
    return await Product.create(productData);
  }

  static async findById(id) {
    return await Product.findById(id).populate('categoryId', 'name');
  }

  static async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search = '',
      categoryId,
      isLowStock
    } = options;

    // Xây dựng bộ lọc
    const filter = { ...query };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (isLowStock !== undefined) {
      // Cần xử lý ở service layer do virtual field
      // Hiện tại, chúng ta sẽ đặt một ngưỡng
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
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

  static async update(id, updateData) {
    return await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
  }

  static async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  static async updateQuantity(id, quantity) {
    return await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );
  }

  static async findByBarcode(barcode) {
    return await Product.findOne({ barcode });
  }

  static async findLowStock(threshold = 10) {
    return await Product.find({
      quantity: { $lte: threshold },
      isActive: true
    }).populate('categoryId', 'name');
  }
}

