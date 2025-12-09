import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('TODO')) {
      console.error('❌ MONGO_URI not configured. Please set it in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu hiện có (tùy chọn - xóa trong production)
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Tạo users
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@store.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: ROLES.ADMIN
    });

    const staffUser = await User.create({
      username: 'staff',
      email: 'staff@store.com',
      password: 'staff123',
      fullName: 'Staff User',
      role: ROLES.STAFF
    });

    console.log('✅ Created users');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Đồ uống', description: 'Nước giải khát, bia, rượu' },
      { name: 'Thực phẩm khô', description: 'Mì tôm, đồ hộp, bánh kẹo' },
      { name: 'Rau củ quả', description: 'Rau tươi, trái cây' },
      { name: 'Thịt cá', description: 'Thịt tươi, cá tươi' },
      { name: 'Sữa và sản phẩm từ sữa', description: 'Sữa tươi, phô mai, yogurt' },
      { name: 'Đồ dùng gia đình', description: 'Khăn giấy, bột giặt, nước rửa chén' }
    ]);

    console.log('✅ Created categories');

    // Create products
    const products = [];
    
    // Đồ uống
    products.push({
      name: 'Coca Cola 330ml',
      price: 15000,
      importPrice: 12000,
      quantity: 100,
      unit: 'chai',
      categoryId: categories[0]._id,
      lowStockThreshold: 20
    });

    products.push({
      name: 'Pepsi 330ml',
      price: 15000,
      importPrice: 12000,
      quantity: 80,
      unit: 'chai',
      categoryId: categories[0]._id,
      lowStockThreshold: 20
    });

    products.push({
      name: 'Nước suối Lavie 500ml',
      price: 8000,
      importPrice: 6000,
      quantity: 150,
      unit: 'chai',
      categoryId: categories[0]._id,
      lowStockThreshold: 30
    });

    // Thực phẩm khô
    products.push({
      name: 'Mì tôm Hảo Hảo tôm chua cay',
      price: 5000,
      importPrice: 3500,
      quantity: 200,
      unit: 'gói',
      categoryId: categories[1]._id,
      lowStockThreshold: 50
    });

    products.push({
      name: 'Mì tôm Omachi',
      price: 6000,
      importPrice: 4500,
      quantity: 180,
      unit: 'gói',
      categoryId: categories[1]._id,
      lowStockThreshold: 50
    });

    products.push({
      name: 'Bánh mì tươi',
      price: 10000,
      importPrice: 7000,
      quantity: 5,
      unit: 'ổ',
      categoryId: categories[1]._id,
      lowStockThreshold: 10
    });

    // Rau củ quả
    products.push({
      name: 'Rau muống',
      price: 10000,
      importPrice: 6000,
      quantity: 20,
      unit: 'bó',
      categoryId: categories[2]._id,
      lowStockThreshold: 10
    });

    products.push({
      name: 'Cà chua',
      price: 25000,
      importPrice: 18000,
      quantity: 15,
      unit: 'kg',
      categoryId: categories[2]._id,
      lowStockThreshold: 5
    });

    // Thịt cá
    products.push({
      name: 'Thịt heo ba chỉ',
      price: 120000,
      importPrice: 100000,
      quantity: 10,
      unit: 'kg',
      categoryId: categories[3]._id,
      lowStockThreshold: 5
    });

    products.push({
      name: 'Cá thu',
      price: 80000,
      importPrice: 65000,
      quantity: 8,
      unit: 'kg',
      categoryId: categories[3]._id,
      lowStockThreshold: 5
    });

    // Sữa
    products.push({
      name: 'Sữa tươi Vinamilk 1L',
      price: 30000,
      importPrice: 25000,
      quantity: 60,
      unit: 'hộp',
      categoryId: categories[4]._id,
      lowStockThreshold: 15
    });

    products.push({
      name: 'Sữa chua Vinamilk',
      price: 8000,
      importPrice: 6000,
      quantity: 100,
      unit: 'hộp',
      categoryId: categories[4]._id,
      lowStockThreshold: 20
    });

    // Đồ dùng gia đình
    products.push({
      name: 'Khăn giấy 2 lớp',
      price: 25000,
      importPrice: 20000,
      quantity: 40,
      unit: 'cuộn',
      categoryId: categories[5]._id,
      lowStockThreshold: 10
    });

    products.push({
      name: 'Bột giặt Omo',
      price: 45000,
      importPrice: 38000,
      quantity: 30,
      unit: 'gói',
      categoryId: categories[5]._id,
      lowStockThreshold: 10
    });

    await Product.insertMany(products);
    console.log('✅ Created products');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Staff: username=staff, password=staff123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

