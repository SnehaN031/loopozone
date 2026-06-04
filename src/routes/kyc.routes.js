const express = require('express');
const kycController = require('../controllers/kycController');
const { protect } = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protect all KYC endpoints using JWT check
router.use(protect);

router.post('/aadhaar/send-otp', kycController.sendAadhaarOtp);
router.post('/aadhaar/verify-otp', kycController.verifyAadhaarOtp);
router.post('/pan/verify', upload.single('panImage'), kycController.verifyPan);
router.post('/gst/verify', upload.single('gst'), kycController.uploadGst);
router.post('/selfie', upload.single('selfie'), kycController.uploadSelfie);
router.post('/seller-type', kycController.updateSellerType);
router.get('/status', kycController.getKycStatus);
router.post('/reupload', kycController.reuploadKYC);
router.post('/submit', kycController.submitKyc);

module.exports = router;
