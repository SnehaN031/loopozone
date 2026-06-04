const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/check-user', [
  body('phone').notEmpty()
], authController.checkUser);

router.post('/signup', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty()
], authController.signup);

router.post('/send-otp', [
  body('phone').notEmpty()
], authController.sendOTP);

router.post('/verify-otp', [
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 })
], authController.verifyOTP);

// Email OTP verification endpoints (JWT protected)
const { protect } = require('../middleware/verifyJWT');

router.post('/send-email-otp', protect, authController.sendEmailOtpHandler);
router.post('/verify-email-otp', protect, [
  protect,
  body('otp').isLength({ min: 6, max: 6 })
], authController.verifyEmailOtpHandler);

module.exports = router;
