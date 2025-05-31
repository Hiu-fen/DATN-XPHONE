const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  discountType: { type: String, required: true },
  description: { type: String },
  applicableProducts: { type: String },
  condition: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('promotions', promotionSchema);
