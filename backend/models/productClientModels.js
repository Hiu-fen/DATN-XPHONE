const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  albumImages: {
    type: [String],
    required: true
  },
  danhmuc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: String,
    required: true
  },
  soluong: {
    type: Number,
    required: true,
    default: 0
  },
  trangthai: {
    type: String,
    required: true,
    enum: ['còn hàng', 'hết hàng'],
    default: 'còn hàng'
  },
  mota: {
    type: String,
    default: ''
  },
  type: {
    type: String
  },
  parent: {
    type: Number
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Tạo index cho các trường thường xuyên tìm kiếm
productSchema.index({ name: 'text' });
productSchema.index({ danhmuc: 1 });
productSchema.index({ price: 1 });
productSchema.index({ trangthai: 1 });

// Virtual để lấy thông tin danh mục
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'danhmuc',
  foreignField: '_id',
  justOne: true
});

// Đảm bảo virtuals được bao gồm trong JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);