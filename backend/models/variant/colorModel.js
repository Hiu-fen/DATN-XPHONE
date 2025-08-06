const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  variantCategory: [{
    type: String,
    ref: 'VariantCategory',
  }],
});

module.exports = mongoose.model('Color', colorSchema);