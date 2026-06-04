const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');

/**
 * Sends/generates an Email OTP and stores it in the database with a 5-minute expiry.
 * @param {string} email - The user's email address.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendEmailOTP = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User profile not found');
  }

  const otp = generateOTP();
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5); // 5 minutes expiry

  user.emailOTP = otp;
  user.emailOTPExpires = expiry;
  await user.save();

  console.log(`[EMAIL OTP] Generated OTP for ${email}: ${otp} (Expires at: ${expiry.toISOString()})`);

  return {
    success: true,
    message: 'Email OTP sent successfully'
  };
};

/**
 * Verifies the submitted Email OTP.
 * @param {string} email - The user's email address.
 * @param {string} otp - The submitted 6-digit OTP code.
 * @returns {Promise<{success: boolean, user: Object}>}
 */
const verifyEmailOTP = async (email, otp) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User profile not found');
  }

  // Dev mode OTP bypass (123456 and 654321)
  if (process.env.NODE_ENV !== 'production' && (otp.trim() === '123456' || otp.trim() === '654321')) {
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    await user.save();
    console.log(`[EMAIL OTP] [DEV BYPASS] Successfully verified email for user: ${email}`);
    return {
      success: true,
      user
    };
  }

  if (!user.emailOTP || !user.emailOTPExpires) {
    throw new Error('No active OTP found. Please request a new OTP.');
  }

  // Check if OTP has expired
  if (new Date() > user.emailOTPExpires) {
    // Clear expired OTP database fields
    user.emailOTP = null;
    user.emailOTPExpires = null;
    await user.save();
    throw new Error('Invalid or expired OTP');
  }

  // Verify code match
  if (user.emailOTP !== otp.trim()) {
    throw new Error('Invalid or expired OTP');
  }

  // OTP is correct - verify email and clear OTP fields
  user.isEmailVerified = true;
  user.emailOTP = null;
  user.emailOTPExpires = null;
  await user.save();

  console.log(`[EMAIL OTP] Successfully verified email for user: ${email}`);

  return {
    success: true,
    user
  };
};

module.exports = {
  sendEmailOTP,
  verifyEmailOTP
};
