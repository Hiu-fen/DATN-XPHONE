const mongoose = require('mongoose');

const ramSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    unique: true,
  },
  variantCategory: [{
    type: String,
    ref: 'VariantCategory',
  }],
});

module.exports = mongoose.model('Ram', ramSchema);