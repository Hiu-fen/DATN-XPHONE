
const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  name: { type: String }, 
  image: { type: String },
  price: { type: Number },
  color: { type: String },
  storage: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { _id: true });
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
}, { timestamps: true });
module.exports = mongoose.model('Cart', cartSchema);