const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  soluong: { type: Number, required: true },
  price: { type: Number, required: true },
  snapshot: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    color: { type: String },
    storage: { type: String },
  },
});

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },

  // TRẠNG THÁI ĐƠN HÀNG
  status: {
    type: String,
    enum: [
      "Chờ xác nhận",
      "Đang xử lý",
      "Đang giao",
      "Giao thành công",
      "Đã nhận hàng",
      "Đã huỷ",
      "Trả hàng/Hoàn tiền",
    ],
    default: "Chờ xác nhận",
  },

  // TRẠNG THÁI THANH TOÁN
  paymentStatus: {
    type: String,
    enum: ["Chưa thanh toán", "Đã thanh toán", "Đã hoàn tiền"],
    default: "Chưa thanh toán",
  },

  items: [OrderItemSchema],
  total: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false }, // Vẫn giữ để tiện filter
  refunded: { type: Boolean, default: false },
  paymentMethod: { type: String }, // VNPAY / COD
  shippingProvider: { type: String },
  trackingNumber: { type: String },
  estimatedDeliveryDate: { type: String },
  notes: { type: String },
  returnStatus: { type: String },
  returnReason: { type: String },
  returnNote: { type: String },
  cancelReason: { type: String },
  returnImages: [{ type: String }],
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  voucherCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  userId: { type: String },
  restored: { type: Boolean, default: false },
});

module.exports = mongoose.model("Order", OrderSchema);
