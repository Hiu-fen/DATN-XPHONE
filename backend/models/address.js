const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }, // ví dụ: "Số 1 Nguyễn Huệ"
  isDefault: { type: Boolean, default: false },

  // GHN fields
  province_id: { type: Number, required: true },
  district_id: { type: Number, required: true },
  ward_code: { type: String, required: true },

  // Optional - chỉ để hiển thị
  province_name: { type: String },
  district_name: { type: String },
  ward_name: { type: String },
});

module.exports = mongoose.model("Address", addressSchema);
