const mongoose = require('mongoose');

const variantCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Màu iPhone", "RAM Samsung"
}, { timestamps: true });

module.exports = mongoose.model('VariantCategory', variantCategorySchema);