const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  discountType: {
    type: String,
    required: true,
    enum: ['percent', 'fixed', 'free_ship'], 
    default: 'free_ship'
  },
  discountValue: { type: Number },
  maxDiscount: { type: Number, default: null }, // Giảm tối đa cho mã phần trăm
  description: { type: String },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  condition: {
    minOrderValue: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu (VNĐ)
    minQuantity: { type: Number, default: 0 },   // Số lượng sản phẩm tối thiểu
  },
  quantity: { type: Number, required: true },
  usageCount: { type: Number, default: 0 }, // Số lần đã sử dụng
  maxUsagePerUser: {
    type: Number,
    default: 1,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('promotions', promotionSchema);
