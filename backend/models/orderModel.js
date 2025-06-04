const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  soluong: { type: Number, required: true },
  price: { type: Number, required: true },
  snapshot: { // Lưu thông tin sản phẩm tại thời điểm đặt hàng
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
  },
});

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Đang xử lý', 'Đã giao', 'Hoàn thành', 'Đã huỷ', 'Trả hàng/Hoàn tiền'], // SỬA: Thêm trạng thái trả hàng
    default: 'Chờ xác nhận' 
  },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paymentMethod: { type: String }, // Phương thức thanh toán
  shippingProvider: { type: String }, // Đơn vị vận chuyển
  trackingNumber: { type: String }, // Mã vận đơn
  estimatedDeliveryDate: { type: String }, // Thời gian giao dự kiến
  notes: { type: String }, // Ghi chú đơn hàng
  returnStatus: { type: String }, // Trạng thái trả hàng
  returnReason: { type: String }, // Lý do trả hàng
  statusHistory: [{ // Lịch sử trạng thái
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('Order', OrderSchema);