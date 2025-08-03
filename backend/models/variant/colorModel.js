const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Red", "Blue"
  variantCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VariantCategory', 
    required: true // Danh mục biến thể là bắt buộc
  }
}, { timestamps: true });

module.exports = mongoose.model('Color', colorSchema);