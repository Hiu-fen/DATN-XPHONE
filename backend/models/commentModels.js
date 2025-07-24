const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Boolean, default: false },
    sanpham: { type: String },
    date: { type: String },
    likes: { type: Number, default: 0 }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Comment', commentSchema);
