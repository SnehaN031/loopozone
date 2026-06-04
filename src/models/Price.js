const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  materialName: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per KG is required'],
    min: [0, 'Price per KG cannot be negative']
  },
  priceChange: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    default: 'Mumbai',
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Price', priceSchema);
