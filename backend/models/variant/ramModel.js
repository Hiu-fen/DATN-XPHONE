// models/ramModel.js
const mongoose = require('mongoose');
const ramSchema = new mongoose.Schema({
  size: { type: String, required: true }  // e.g. "4GB", "8GB"
}, { timestamps: true });
module.exports = mongoose.model('Ram', ramSchema);
