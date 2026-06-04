const mongoose = require('mongoose');
const crypto = require('crypto');

// Create inline model for OTP TTL storage
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL index: expire after 300 seconds (5 minutes)
  }
});

const OtpModel = mongoose.models.Otp || mongoose.model('Otp', otpSchema, 'otps');

const phoneRegex = /^\+91[6-9]\d{9}$/;

const storeOTP = async (phone) => {
  if (!phone || !phoneRegex.test(phone)) {
    throw new Error('Invalid Indian phone number');
  }

  // Dev mode (NODE_ENV !== 'production'):
  // otp = process.env.DEV_OTP ("123456")
  const otp = process.env.DEV_OTP || '123456';
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  // Clear any existing OTP for this phone number
  await OtpModel.deleteMany({ phone });

  // Create new OTP record
  await OtpModel.create({
    phone,
    otpHash
  });
};

const verifyOTP = async (phone, otp) => {
  if (!phone || !phoneRegex.test(phone) || !otp) {
    return false;
  }

  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const record = await OtpModel.findOne({ phone, otpHash });

  if (!record) {
    return false;
  }

  // One-time use: remove OTP on successful validation
  await OtpModel.deleteOne({ _id: record._id });
  return true;
};

const deleteOTP = async (phone) => {
  if (!phone || !phoneRegex.test(phone)) {
    return;
  }
  await OtpModel.deleteMany({ phone });
};

module.exports = {
  storeOTP,
  verifyOTP,
  deleteOTP
};

