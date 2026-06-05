const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const sandboxService = require('../services/sandboxService');
const aadhaarService = require('../services/aadhaarService');
const ocrService = require('../services/ocrService');

const createKycNotification = async (user) => {
  try {
    const Notification = require('../models/Notification');
    const existing = await Notification.findOne({
      referenceId: user._id,
      type: 'KYC_SUBMITTED',
      recipientType: 'ADMIN',
      isRead: false
    });
    if (!existing) {
      await Notification.create({
        title: 'KYC Review Pending',
        message: `${user.name} (${user.phone}) has submitted documents for approval.`,
        type: 'KYC_SUBMITTED',
        recipientType: 'ADMIN',
        referenceId: user._id
      });
      console.log(`[NOTIFICATION] Generated KYC submission notification for user: ${user.phone}`);
    }
  } catch (err) {
    console.warn('[NOTIFICATION WARNING] Failed to create KYC notification:', err.message);
  }
};

const checkKycCompletion = async (user) => {
  if (
    user.aadhaarVerified &&
    user.panVerified &&
    user.gstVerified &&
    user.selfieImage
  ) {
    user.kycStatus = 'pending_review'
    user.isKycVerified = false
    await user.save()
    console.log('[KYC] Onboarding docs complete, pending admin review:', user.phone)
    await createKycNotification(user);
    return { pendingReview: true }
  }

  return { pendingReview: false }
};

// POST /kyc/aadhaar/send-otp
const sendAadhaarOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ success: false, error: 'Valid 12-digit Aadhaar number is required' });
    }

    const verification = await aadhaarService.sendAadhaarOtp(aadhaarNumber);

    const sandboxResponse = { data: verification };
    console.log("Generate OTP Response:", sandboxResponse.data);

    const referenceId = sandboxResponse.data.data?.reference_id || sandboxResponse.data.reference_id;

    const maskedAadhaar = ('XXXX-XXXX-' + aadhaarNumber.slice(-4));
    const aadhaarExists = await User.findOne({
      aadhaarNumber: maskedAadhaar,
      _id: { $ne: req.user.id }
    });
    if (aadhaarExists) {
      return res.status(400).json({
        success: false,
        error: 'This Aadhaar is already linked to another account'
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      aadhaarReferenceId: referenceId
    });

    const responsePayload = {
      success: true,
      message: 'Aadhaar OTP sent successfully',
      referenceId: referenceId
    };
    if (process.env.NODE_ENV !== 'production' && verification.data?.otp) {
      responsePayload.devOtp = verification.data.otp;
    }
    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// POST /kyc/aadhaar/verify-otp
const verifyAadhaarOtp = async (req, res, next) => {
  try {
    const { otp, referenceId, aadhaarNumber } = req.body;
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, error: 'Valid 6-digit OTP is required' });
    }
    if (!referenceId) {
      return res.status(400).json({ success: false, error: 'Aadhaar reference ID is missing' });
    }
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ success: false, error: 'Aadhaar number is missing or invalid' });
    }

    const verification = await aadhaarService.verifyAadhaarOtp(otp, referenceId, req.user.name, aadhaarNumber);
    
    const sandboxData = verification.data || verification;

    const maskedAadhaar = sandboxData.masked_aadhaar || ('XXXX-XXXX-' + aadhaarNumber.slice(-4));
    const verifiedName = sandboxData.name || req.user.name;
    const verifiedDob = sandboxData.dob || sandboxData.date_of_birth;
    const verifiedGender = sandboxData.gender || null;

    let formattedAddress = '';
    if (typeof sandboxData.address === 'object' && sandboxData.address !== null) {
      const parts = [];
      if (sandboxData.address.house) parts.push(sandboxData.address.house);
      if (sandboxData.address.street) parts.push(sandboxData.address.street);
      if (sandboxData.address.loc) parts.push(sandboxData.address.loc);
      if (sandboxData.address.po) parts.push(sandboxData.address.po);
      if (sandboxData.address.subdist) parts.push(sandboxData.address.subdist);
      if (sandboxData.address.district) parts.push(sandboxData.address.district);
      if (sandboxData.address.state) parts.push(sandboxData.address.state);
      if (sandboxData.address.pincode) parts.push(sandboxData.address.pincode);
      if (sandboxData.address.country) parts.push(sandboxData.address.country);
      formattedAddress = parts.join(', ');
    } else if (typeof sandboxData.address === 'string') {
      formattedAddress = sandboxData.address;
    } else {
      formattedAddress = null;
    }

    await User.findByIdAndUpdate(req.user.id, {
      aadhaarVerified: true,
      isAadhaarVerified: true,
      aadhaarNumber: maskedAadhaar,
      aadhaarName: verifiedName,
      aadhaarDob: verifiedDob,
      aadhaarGender: verifiedGender,
      aadhaarAddress: formattedAddress,
      aadhaarData: {
        ...sandboxData,
        name: verifiedName,
        dob: verifiedDob,
        gender: verifiedGender,
        address: formattedAddress,
        masked_aadhaar: maskedAadhaar
      },
      aadhaarReferenceId: null,
      "documents.aadhaar": maskedAadhaar
    });

    const user = await User.findById(req.user.id);
    await checkKycCompletion(user);

    return res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully',
      aadhaarData: user.aadhaarData
    });
  } catch (error) {
    next(error);
  }
};

// POST /kyc/pan/verify
const normalizePAN = (pan) => {
   return pan
      .replace(/\s/g,"")
      .toUpperCase()
      .trim();
};

const verifyPan = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => (f.fieldname || '').toLowerCase().includes('pan')) || req.files[0];
    }

    // Step 1: Image is mandatory
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'PAN card image is required'
      })
    }

    // Step 2: PAN number is mandatory
    const { pan } = req.body
    if (!pan) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'PAN number is required'
      })
    }

    // Step 3: Validate PAN format
    const cleanEnteredPAN = normalizePAN(pan);
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanEnteredPAN)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'Invalid PAN format. Example: ABCDE1234F'
      })
    }

    // Step 4: Check user exists
    const user = await User.findById(req.user.id)
    if (!user) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Step 5: Unique PAN check
    const panExists = await User.findOne({
      panNumber: cleanEnteredPAN,
      _id: { $ne: req.user.id }
    })
    if (panExists) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'This PAN is already linked to another account'
      })
    }

    // Step 6: Run OCR on uploaded image
    const { extractedPAN, rawText } = await ocrService.extractPANDetails(req.file.path)

    // Step 7: OCR Debugging logs
    console.log(
       "RAW OCR:",
       rawText
    );

    console.log(
       "EXTRACTED PAN:",
       extractedPAN
    );

    console.log(
       "ENTERED PAN:",
       cleanEnteredPAN
    );

    if (!extractedPAN) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'Could not detect PAN number from uploaded image. Please upload a clearer photo of your PAN card.'
      })
    }

    const cleanExtractedPAN = normalizePAN(extractedPAN);

    // Step 8: Compare entered PAN with extracted PAN
    if (cleanEnteredPAN !== cleanExtractedPAN) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'PAN number mismatch'
      })
    }

    // Step 9: Save to DB
    const panImagePath = `/uploads/pan/${req.file.filename}`

    await User.findByIdAndUpdate(req.user.id, {
      panVerified: true,
      panNumber: cleanEnteredPAN,
      panImage: panImagePath,
      panVerificationData: {
        extractedPAN: cleanExtractedPAN,
        verifiedAt: new Date()
      },
      "documents.pan": panImagePath
    })

    const updatedUser = await User.findById(req.user.id)
    await checkKycCompletion(updatedUser)

    return res.status(200).json({
      success: true,
      message: 'PAN card verified successfully',
      data: {
        pan: cleanEnteredPAN
      }
    })

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    next(error)
  }
}

// POST /kyc/gst/verify
const uploadGst = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => (f.fieldname || '').toLowerCase().includes('gst')) || req.files[0];
    }

    // Step 1: Check file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'GST certificate is required. Please upload image or PDF.'
      })
    }

    // Step 2: Check GSTIN number provided
    const { gstNumber } = req.body
    if (!gstNumber) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'GSTIN number is required'
      })
    }

    // Step 3: Validate GSTIN format
    const cleanGst = gstNumber.toUpperCase().trim()
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gstinRegex.test(cleanGst)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5'
      })
    }

    // Step 4: Check user profile
    const user = await User.findById(req.user.id)
    if (!user) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Step 5: Check GSTIN not already used by another account
    const gstExists = await User.findOne({
      gstNumber: cleanGst,
      _id: { $ne: req.user.id }
    })
    if (gstExists) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'This GSTIN is already linked to another account'
      })
    }

    // Step 6: Run OCR on uploaded certificate
    const { extractedGSTIN } = await ocrService.extractGSTINFromCertificate(req.file.path)

    // Step 7: OCR must find a GSTIN
    if (!extractedGSTIN) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'Could not detect GSTIN from uploaded certificate. Please upload a clearer image or PDF of your GST certificate.'
      })
    }

    // Step 8: OCR extracted GSTIN must EXACTLY match typed GSTIN
    if (extractedGSTIN !== cleanGst) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        error: `GSTIN mismatch. You entered ${cleanGst} but certificate shows ${extractedGSTIN}. Please upload the correct GST certificate.`
      })
    }

    // Step 9: All checks passed — save to DB
    const gstImagePath = `/uploads/gst/${req.file.filename}`

    await User.findByIdAndUpdate(req.user.id, {
      gstVerified: true,
      gstNumber: cleanGst,
      gstImage: gstImagePath,
      gstVerificationData: {
        extractedGSTIN,
        verifiedAt: new Date(),
        verificationMethod: 'ocr'
      },
      "documents.gst": gstImagePath
    })

    const updatedUser = await User.findById(req.user.id)
    await checkKycCompletion(updatedUser)

    return res.status(200).json({
      success: true,
      message: 'GST certificate verified successfully',
      data: {
        gstin: cleanGst,
        gstinMatch: true
      }
    })

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    next(error)
  }
}

// POST /kyc/selfie
const uploadSelfie = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => (f.fieldname || '').toLowerCase().includes('selfie')) || req.files[0];
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload selfie image file' });
    }

    const user = await User.findById(req.user.id);
    user.selfieImage = `/uploads/selfie/${req.file.filename}`;
    user.documents.selfie = `/uploads/selfie/${req.file.filename}`;
    await user.save();

    const result = await checkKycCompletion(user);

    return res.status(200).json({
      success: true,
      message: 'Selfie uploaded successfully',
      filePath: user.selfieImage,
      pendingReview: result.pendingReview,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

const getKycStatus = async (req, res, next) => {
  try {
    console.log(`[DEBUG] [KYC] Checking KYC status checklist for user ID: ${req.user.id} (${req.user.phone})`);
    const user = await User.findById(req.user.id)
    if (!user) {
      console.warn(`[DEBUG] [KYC] User not found for ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Build steps based on seller type
    const documents = {
      aadhaar: user.aadhaarVerified ? 'verified' : 'pending',
      pan: user.panVerified ? 'verified' : 'pending',
      gst: user.gstVerified ? 'verified' : 'pending',
      selfie: user.selfieImage ? 'verified' : 'pending'
    }

    // Calculate progress
    const totalSteps = 4
    const completedSteps = Object.values(documents)
      .filter(v => v === 'verified').length

    console.log(`[DEBUG] [KYC] User: ${user.phone} | KYC Status: ${user.kycStatus} | Progress: ${completedSteps}/${totalSteps} (${Math.round((completedSteps / totalSteps) * 100)}%)`);
    console.log(`[DEBUG] [KYC] Documents Checklist -> Aadhaar: ${documents.aadhaar} | PAN: ${documents.pan} | GST: ${documents.gst} | Selfie: ${documents.selfie}`);

    return res.status(200).json({
      success: true,
      sellerType: user.sellerType,
      isKycVerified: user.isKycVerified,
      kycStatus: user.kycStatus,
      rejectionReason: user.rejectionReason || null,
      progress: {
        completed: completedSteps,
        total: totalSteps,
        percentage: Math.round((completedSteps / totalSteps) * 100)
      },
      documents
    })

  } catch (error) {
    next(error)
  }
}

// POST /kyc/reupload
const reuploadKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.kycStatus !== 'rejected') {
      return res.status(400).json({ success: false, error: "Re-upload only allowed after rejection" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      kycStatus: 'in_progress',
      isKycVerified: false,
      rejectionReason: null,
      reviewedAt: null,
      reviewedBy: null,
      aadhaarVerified: false,
      aadhaarNumber: null,
      aadhaarName: null,
      aadhaarDob: null,
      aadhaarData: null,
      aadhaarReferenceId: null,
      panVerified: false,
      panNumber: null,
      panImage: null,
      panVerificationData: null,
      gstVerified: false,
      gstNumber: null,
      gstImage: null,
      gstVerificationData: null,
      selfieImage: null,
      documents: {
        aadhaar: null,
        pan: null,
        gst: null,
        selfie: null
      },
      $inc: { reuploadCount: 1 }
    });

    return res.status(200).json({
      success: true,
      message: "KYC reset. Please re-upload your documents.",
      kycStatus: "in_progress"
    });
  } catch (error) {
    next(error);
  }
}

const updateSellerType = async (req, res, next) => {
  try {
    const { sellerType } = req.body;
    if (!sellerType || !['individual', 'business'].includes(sellerType)) {
      return res.status(400).json({ success: false, error: 'Invalid sellerType. Must be individual or business.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isKycVerified) {
      return res.status(400).json({ success: false, error: 'Cannot change seller type after KYC is verified' });
    }

    user.sellerType = sellerType;
    await user.save();
    
    await checkKycCompletion(user);

    return res.status(200).json({
      success: true,
      message: `Seller type successfully updated to ${sellerType}`,
      sellerType: user.sellerType
    });
  } catch (error) {
    next(error);
  }
};

const submitKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const hasAadhaar = user.aadhaarVerified;
    const hasPan = user.panVerified;
    const hasSelfie = !!user.selfieImage;
    const hasGst = user.gstVerified;

    if (!hasAadhaar || !hasPan || !hasSelfie || !hasGst) {
      return res.status(400).json({ success: false, error: 'Please upload all required documents first' });
    }

    user.kycStatus = 'pending_review';
    user.isKycVerified = false;
    await user.save();

    console.log('[KYC] User explicitly submitted onboarding:', user.phone);

    await createKycNotification(user);

    return res.status(200).json({
      success: true,
      message: 'KYC documents submitted successfully',
      kycStatus: user.kycStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  verifyPan,
  uploadGst,
  uploadSelfie,
  getKycStatus,
  updateSellerType,
  reuploadKYC,
  submitKyc
};

