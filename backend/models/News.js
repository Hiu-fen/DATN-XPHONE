const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
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
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    category: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema); 