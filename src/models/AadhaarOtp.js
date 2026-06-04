const mongoose = require('mongoose');

const aadhaarOtpSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true
  },
  aadhaarNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Auto-delete records when they expire using a TTL index
aadhaarOtpSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AadhaarOtp', aadhaarOtpSchema);
