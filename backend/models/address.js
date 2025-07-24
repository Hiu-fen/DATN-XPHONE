const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  detail: { type: String, default: "" },
  province_id: { type: String, default: "" },
  district_id: { type: String, default: "" },
  ward_code: { type: String, default: "" },
  isDefault: { type: Boolean, default: false },
});

module.exports = mongoose.model("Address", addressSchema);
