const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String },
    status: { type: Boolean, default: false },
    replyImage: { type: String }, // Lưu URL ảnh từ Cloudinary
    replyDate: { type: String } // Thời gian phản hồi
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);  