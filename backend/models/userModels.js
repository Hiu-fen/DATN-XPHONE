const mongoose = require('mongoose');

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
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
