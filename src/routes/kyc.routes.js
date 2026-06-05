const express = require('express');
const kycController = require('../controllers/kycController');
const { protect } = require('../middleware/verifyJWT');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protect all KYC endpoints using JWT check
router.use(protect);

router.post('/aadhaar/send-otp', kycController.sendAadhaarOtp);
router.post('/aadhaar/verify-otp', kycController.verifyAadhaarOtp);
router.post('/pan/verify', upload.any(), kycController.verifyPan);
router.post('/upload-pan', upload.any(), kycController.verifyPan);

router.post('/gst/verify', upload.any(), kycController.uploadGst);
router.post('/upload-gst', upload.any(), kycController.uploadGst);

router.post('/selfie', upload.any(), kycController.uploadSelfie);
router.post('/upload-selfie', upload.any(), kycController.uploadSelfie);
router.post('/seller-type', kycController.updateSellerType);
router.get('/status', kycController.getKycStatus);
router.post('/reupload', kycController.reuploadKYC);
router.post('/submit', kycController.submitKyc);

module.exports = router;
