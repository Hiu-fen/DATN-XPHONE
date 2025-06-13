const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true 
  },
  description: { 
    type: String
  },   
  imageUrl: { 
    type: String,
     required: true
  },
  link: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date,
    required: true
  },
  endDate: { 
    type: Date,
    required: true 
  },
  status: { 
    type: Boolean,
     default: true 
  },
  order: { 
    type: Number,
    default: 0 
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
