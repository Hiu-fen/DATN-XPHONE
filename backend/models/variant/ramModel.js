const mongoose = require('mongoose');

const ramSchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g. "4GB", "8GB"
  variantCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VariantCategory', 
    required: true // Danh mục biến thể là bắt buộc
  }
}, { timestamps: true });

module.exports = mongoose.model('Ram', ramSchema);