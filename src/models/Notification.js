const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['NEW_USER', 'KYC_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED', 'WELCOME', 'GENERAL'],
    default: 'GENERAL'
  },
  recipientType: {
    type: String,
    enum: ['USER', 'ADMIN'],
    required: true,
    default: 'USER'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
