const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  soluong: { type: Number, required: true },
  mota: { type: String },
  danhmuc: { type: String   , required: true },
  trangthai: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
