// models/notificationModels.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  message: { type: String, required: true },
  scope: {
    type: String,
    enum: ['global', 'admin', 'user'],
    required: false
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'order', 'product', 'promotion'],
    default: 'info'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
  },
  role: { type: String, enum: ['user', 'admin'], required: true }, 

  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
