const mongoose = require("mongoose")

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
})

// Schema cho thông tin người đặt hàng
const OrdererInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false },
)

// Schema cho thông tin người nhận hàng
const RecipientInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    note: { type: String },
  },
  { _id: false },
)

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },

  // Thông tin cũ - giữ lại để tương thích ngược
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },

  // Thông tin mới - người đặt hàng và người nhận hàng
  ordererInfo: OrdererInfoSchema,
  recipientInfo: RecipientInfoSchema,

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
  originalTotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  refunded: { type: Boolean, default: false },
  paymentMethod: { type: String },
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
  returnStatusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  voucherCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  orderDiscount: { type: Number, default: 0 },
  userId: { type: String },
  restored: { type: Boolean, default: false },
  isBuyNow: { type: Boolean, default: false },
})

module.exports = mongoose.model("Order", OrderSchema)
