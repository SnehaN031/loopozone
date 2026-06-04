const User = require('../models/User');
const otpService = require('../services/otpService');
const jwtHelper = require('../utils/jwtHelper');
const emailOtpService = require('../services/emailOtpService');

const phoneRegex = /^\+91[6-9]\d{9}$/;

// POST /auth/check-user
const checkUser = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number' });
    }

    const user = await User.findOne({ phone });
    if (user) {
      return res.status(200).json({
        success: true,
        existingUser: true,
        isKycVerified: user.isKycVerified,
        redirect: '/login'
      });
    } else {
      return res.status(200).json({
        success: true,
        existingUser: false,
        redirect: '/signup'
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number' });
    }

    // RULE 1: Duplicate phone numbers not allowed
    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // RULE 2: Duplicate emails not allowed
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser) {
      return res.status(400).json({ success: false, message: 'Email ID already registered' });
    }

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      isKycVerified: false,
      kycStatus: 'pending'
    });

    await newUser.save();

    // Generate JWT token for temporary onboarding session
    const token = jwtHelper.signToken({
      userId: newUser._id,
      phone: newUser.phone,
      isKycVerified: newUser.isKycVerified
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
        isKycVerified: newUser.isKycVerified,
        kycStatus: newUser.kycStatus,
        rejectionReason: newUser.rejectionReason
      }
    });

  } catch (error) {
    next(error);
  }
};

// POST /auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number' });
    }

    const user = await User.findOne({ phone });
    if (user) {
      if (user.kycStatus === 'pending_review') {
        return res.status(200).json({
          success: false,
          pendingReview: true,
          message: 'Your KYC is currently under admin review. Please wait for approval.'
        });
      }

      if (user.kycStatus === 'rejected') {
        // Generate temporary JWT token for onboarding/reupload access
        const token = jwtHelper.signToken({
          userId: user._id,
          phone: user.phone,
          isKycVerified: user.isKycVerified
        });
        return res.status(200).json({
          success: false,
          rejected: true,
          message: 'KYC rejected',
          reason: user.rejectionReason || 'Documents did not meet our verification standards.',
          token
        });
      }
    }

    await otpService.storeOTP(phone);
    
    return res.status(200).json({
      success: true,
      status: 'otp_sent',
      message: 'OTP sent. Dev mode: use 123456'
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number' });
    }

    if (!otp || otp !== '123456') {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const isValid = await otpService.verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    const token = jwtHelper.signToken({
      userId: user._id,
      phone: user.phone,
      isKycVerified: user.isKycVerified
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isKycVerified: user.isKycVerified,
        kycStatus: user.kycStatus,
        rejectionReason: user.rejectionReason
      }
    });

  } catch (error) {
    next(error);
  }
};

const sendEmailOtpHandler = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const result = await emailOtpService.sendEmailOTP(req.user.email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtpHandler = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, error: 'OTP is required' });
    }
    const result = await emailOtpService.verifyEmailOTP(req.user.email, otp);
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        isEmailVerified: result.user.isEmailVerified,
        isKycVerified: result.user.isKycVerified,
        kycStatus: result.user.kycStatus
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkUser,
  signup,
  sendOTP,
  verifyOTP,
  sendEmailOtpHandler,
  verifyEmailOtpHandler
};
