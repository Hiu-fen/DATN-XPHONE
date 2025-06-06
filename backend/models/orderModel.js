const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Đang xử lý', 'Đã giao', 'Hoàn thành', 'Đã huỷ'], 
    default: 'Chờ xác nhận' 
  },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
});
// alo

module.exports = mongoose.model('Order', OrderSchema);
 