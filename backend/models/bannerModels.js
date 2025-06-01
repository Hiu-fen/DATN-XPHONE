const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  status: { type: Boolean, default: true }
});

module.exports = mongoose.model('Banner', bannerSchema);
