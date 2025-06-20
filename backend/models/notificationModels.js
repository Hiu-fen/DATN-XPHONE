// models/notificationModels.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // cá nhân
  message: { type: String, required: true },
  scope: {
    type: String,
    enum: ['global', 'admin', 'staff', 'user'],
    required: false
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
  },

  // MỚI: theo dõi user nào đã đọc/xóa
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
