import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  importPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'cái'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.pre('save', async function(next) {
  if (!this.barcode && this.isNew) {
    try {
      const timestamp = Date.now().toString().slice(-8);
      let barcode = '';
      let exists = true;
      let counter = 0;
      
      while (exists && counter < 10) {
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        barcode = `BC${timestamp}${random}`;
        
      // Kiểm tra mã vạch đã tồn tại chưa (bỏ qua nếu model chưa được đăng ký)
      try {
        const ProductModel = mongoose.models.Product || mongoose.model('Product');
        exists = await ProductModel.findOne({ barcode });
      } catch (err) {
        // Model chưa được đăng ký, giả định là duy nhất
        exists = false;
      }
        
        counter++;
      }
      
      this.barcode = barcode || `BC${timestamp}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    } catch (error) {
      // Nếu tạo mã vạch thất bại, sử dụng phương án dự phòng
      this.barcode = `BC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }
  next();
});

// Virtual cho lợi nhuận
productSchema.virtual('profit').get(function() {
  return this.price - this.importPrice;
});

// Virtual cho trạng thái sắp hết hàng
productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Chỉ mục cho tìm kiếm
productSchema.index({ name: 'text', barcode: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });

export const Product = mongoose.model('Product', productSchema);

