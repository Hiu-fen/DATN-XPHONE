const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  mota: { type: String, default: '' },
  image: { type: String, required: true },
  type: { type: String, default: '' }, // có thể để trống nếu chưa dùng
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
