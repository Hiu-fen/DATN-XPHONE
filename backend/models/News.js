const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    status: {  
        type: Boolean,
        default: false
    },
    views: { 
        type: Number, 
        default: 0 
    },
    viewedBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            viewedAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
