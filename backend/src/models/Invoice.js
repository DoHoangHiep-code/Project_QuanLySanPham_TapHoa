import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
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
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    required: true,
    default: 0
  },
  customerName: {
    type: String,
    trim: true,
    default: 'Khách lẻ'
  },
  customerPhone: {
    type: String,
    trim: true,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Tạo số hóa đơn trước khi validate để thỏa mãn ràng buộc required
invoiceSchema.pre('validate', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice');
      const count = await InvoiceModel.countDocuments();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      this.invoiceNumber = `INV-${date}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Dự phòng nếu model chưa được đăng ký
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      this.invoiceNumber = `INV-${date}-${random}`;
    }
  }
  next();
});

// Các chỉ mục
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ createdBy: 1 });
invoiceSchema.index({ status: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);

