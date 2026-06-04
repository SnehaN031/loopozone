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

    // Generate access & refresh tokens
    const token = jwtHelper.signToken({
      userId: newUser._id,
      email: newUser.email,
      phone: newUser.phone,
      isKycVerified: newUser.isKycVerified
    });
    const refreshToken = jwtHelper.signRefreshToken({ userId: newUser._id });

    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      refreshToken,
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
          email: user.email,
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
      email: user.email,
      phone: user.phone,
      isKycVerified: user.isKycVerified
    });
    const refreshToken = jwtHelper.signRefreshToken({ userId: user._id });

    user.refreshTokens.push(refreshToken);
    await user.save();

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
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
  console.log(`[EMAIL OTP] [HIT] Request to send-email-otp for user ID: ${req.user?._id}, email: ${req.user?.email}`);
  try {
    if (!req.user || !req.user.email) {
      console.error(`[EMAIL OTP] [ERROR] Blocked send-email-otp - User profile email not populated. User ID: ${req.user?._id}`);
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const result = await emailOtpService.sendEmailOTP(req.user.email);
    console.log(`[EMAIL OTP] [SUCCESS] Email OTP sent successfully to ${req.user.email}`);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[EMAIL OTP] [ERROR] Failed to send Email OTP to ${req.user?.email || 'unknown'}. Error: ${error.message}`);
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

const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwtHelper.verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, error: 'Invalid or revoked refresh token' });
    }

    const newToken = jwtHelper.signToken({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      isKycVerified: user.isKycVerified
    });
    const newRefreshToken = jwtHelper.signRefreshToken({ userId: user._id });

    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: refreshToken } }
      );
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkUser,
  signup,
  sendOTP,
  verifyOTP,
  sendEmailOtpHandler,
  verifyEmailOtpHandler,
  refreshTokenHandler,
  logout
};
