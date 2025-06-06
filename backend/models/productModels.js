const mongoose = require('mongoose');

const variantSubSchema = new mongoose.Schema({
  color: { type: String, required: true },
  ram: { type: String, required: true },
  price: { type: Number, required: true },
  soluong: { type: Number, required: true },

});


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  albumImages: { type: [String], required: true }, 
  price: { type: String, required: true },
  soluong: { type: Number, required: true },
  mota: { type: String },
  danhmuc: { type: String   , required: true },
  trangthai: { type: String, required: true },
  status: { type: Boolean, default: true },
 variants: {
      type: [variantSubSchema],
      default: [], // nếu không thêm biến thể thì là mảng rỗng
    },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
