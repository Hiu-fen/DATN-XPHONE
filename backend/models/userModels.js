const mongoose = require('mongoose');

// Schema con để lưu thông tin thay đổi
const changeSchema = new mongoose.Schema({
  field: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
});

// Schema chính cho User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // ❗ Không required vì Google không dùng mật khẩu
  sdt: { type: String },
  gender: { type: String },
  address: { type: String },
  avatar: { type: String, default: '' },
  active: { type: Boolean, default: true },
  dob: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  notification: { type: String },
  provider: { type: String, default: 'google' },
  like: {
    type: [String],
    default: [],
  },
  // Thêm lịch sử cập nhật
  updateHistory: [
    {
      updatedAt: { type: Date, default: Date.now },
      changes: [changeSchema],
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
