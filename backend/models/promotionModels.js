const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  discountType: {
    type: String,
    required: true,
    enum: ['giam_10%', 'giam_50k', 'free_ship'], 
    default: 'giam_10%' 
  },
  description: { type: String },
  applicableCategories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  condition: { type: String },
  quantity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('promotions', promotionSchema);
