const axios = require('axios');

const isMock = () => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return !process.env.SANDBOX_API_KEY || 
         process.env.SANDBOX_API_KEY === 'your_sandbox_api_key' ||
         process.env.SANDBOX_API_KEY.startsWith('your_') ||
         process.env.SANDBOX_API_KEY.startsWith('mock_');
};

const isBypassAadhaar = (aadhaarNum) => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return aadhaarNum === '123456789012' || (aadhaarNum && aadhaarNum.startsWith('1234'));
};

const sendAadhaarOtp = async (aadhaarNumber) => {
  if (isMock() || isBypassAadhaar(aadhaarNumber)) {
    if (aadhaarNumber.includes('0000')) {
      throw new Error('Aadhaar verification failed: Invalid Aadhaar number.');
    }

    const AadhaarOtp = require('../models/AadhaarOtp');
    
    // Generate random 6-digit OTP, or use DEV_OTP environment variable if set
    const otp = process.env.DEV_OTP || Math.floor(100000 + Math.random() * 900000).toString();
    const referenceId = `ref_mock_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save temporarily in MongoDB
    await AadhaarOtp.create({
      referenceId,
      aadhaarNumber,
      otp,
      otpExpires
    });

    console.log(`[MOCK AADHAAR OTP] Generated for ${aadhaarNumber}: ${otp} (Reference ID: ${referenceId}, Expires: ${otpExpires.toISOString()})`);

    return {
      success: true,
      message: 'OTP sent to registered Aadhaar mobile number (Mock Mode)',
      data: {
        reference_id: referenceId,
        otp: otp
      }
    };
  }

  const { getAccessToken } = require('./sandboxService');
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp',
      {
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
        "aadhaar_number": aadhaarNumber,
        "consent": "Y",
        "reason": "KYC verification"
      },
      {
        headers: {
          'x-api-key': process.env.SANDBOX_API_KEY,
          'Authorization': accessToken,
          'x-api-version': '1.0.0',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log("Generate OTP Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('[SANDBOX AADHAAR OTP SEND ERROR]:', error.message);
    if (error.response) {
      const status = error.response.status;
      if (status === 400 || status === 422 || status === 404) {
        const errorMsg = error.response.data?.message || 'Aadhaar OTP send failed';
        throw new Error(errorMsg);
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SANDBOX AADHAAR OTP SEND FALLBACK]: Falling back to mock reference.');
      
      const AadhaarOtp = require('../models/AadhaarOtp');
      const otp = process.env.DEV_OTP || Math.floor(100000 + Math.random() * 900000).toString();
      const referenceId = `ref_mock_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      await AadhaarOtp.create({
        referenceId,
        aadhaarNumber,
        otp,
        otpExpires
      });

      console.log(`[MOCK AADHAAR OTP FALLBACK] Generated: ${otp} (Reference ID: ${referenceId})`);

      return {
        success: true,
        message: 'OTP sent to registered Aadhaar mobile number (Fallback Mode)',
        data: {
          reference_id: referenceId,
          otp: otp
        }
      };
    }
    const errorMsg = error.response?.data?.message || error.message || 'Aadhaar OTP send failed';
    throw new Error(errorMsg);
  }
};

const verifyAadhaarOtp = async (otp, referenceId, dynamicName, aadhaarNumber) => {
  if (isMock() || (typeof referenceId === 'string' && referenceId.startsWith('ref_mock_'))) {
    const AadhaarOtp = require('../models/AadhaarOtp');
    const otpRecord = await AadhaarOtp.findOne({ referenceId });
    if (!otpRecord) {
      throw new Error('Aadhaar OTP verification failed: Reference ID not found.');
    }

    if (otpRecord.otpExpires < new Date()) {
      await AadhaarOtp.deleteOne({ referenceId });
      throw new Error('Aadhaar OTP verification failed: OTP has expired.');
    }

    if (otpRecord.otp !== String(otp)) {
      throw new Error('Aadhaar OTP verification failed: Invalid OTP entered.');
    }

    // Clear OTP after successful verification
    await AadhaarOtp.deleteOne({ referenceId });

    const last4 = (aadhaarNumber && typeof aadhaarNumber === 'string') ? aadhaarNumber.slice(-4) : '1234';
    let mockGender = "Female";
    let mockHouse = "Flat 302";
    let finalName = dynamicName || "Sneha Nair";
    let mockDob = "17-10-2002";

    if (aadhaarNumber && typeof aadhaarNumber === 'string' && aadhaarNumber !== '123456789999' && aadhaarNumber !== '123456789012') {
      const lastDigit = parseInt(last4.slice(-1)) || 0;
      finalName = dynamicName || `Aadhaar User ${last4}`;
      mockGender = (lastDigit % 2 === 1) ? "Male" : "Female";
      mockHouse = `Flat ${last4}`;
      mockDob = `15-08-199${lastDigit}`;
    }

    const mockSandboxResponse = {
      code: 200,
      timestamp: Date.now(),
      transaction_id: `tx_mock_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`,
      data: {
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc",
        reference_id: referenceId,
        status: "VALID",
        message: "Aadhaar Card Exists",
        name: finalName,
        date_of_birth: mockDob,
        gender: mockGender,
        address: {
          house: mockHouse,
          street: "Green Glen Layout",
          loc: "Bellandur",
          district: "Bengaluru",
          state: "Karnataka",
          pincode: "560103",
          country: "India"
        },
        photo: "mock_photo_base64",
        masked_aadhaar: `XXXXXXXX${last4}`
      }
    };

    console.log("Mock Sandbox Aadhaar Response:", mockSandboxResponse);
    return mockSandboxResponse;
  }

  const { getAccessToken } = require('./sandboxService');
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
      {
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
        "reference_id": String(referenceId),
        "otp": String(otp)
      },
      {
        headers: {
          'x-api-key': process.env.SANDBOX_API_KEY,
          'Authorization': accessToken,
          'x-api-version': '1.0.0',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log("Sandbox Aadhaar Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('[SANDBOX AADHAAR OTP VERIFY ERROR]:', error.message);
    if (error.response) {
      console.log("Sandbox Aadhaar Response Error:", error.response.data);
      const status = error.response.status;
      if (status === 400 || status === 422 || status === 404) {
        const errorMsg = error.response.data?.message || 'Aadhaar OTP verification failed';
        throw new Error(errorMsg);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SANDBOX AADHAAR OTP VERIFY FALLBACK]: Falling back to mock verification data.');
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('Aadhaar OTP verification failed: Invalid OTP format.');
      }
      
      const last4 = (aadhaarNumber && typeof aadhaarNumber === 'string') ? aadhaarNumber.slice(-4) : '1234';
      let mockGender = "Female";
      let mockHouse = "Flat 302";
      let finalName = dynamicName || "Sneha Nair";
      let mockDob = "17-10-2002";

      if (aadhaarNumber && typeof aadhaarNumber === 'string' && aadhaarNumber !== '123456789999' && aadhaarNumber !== '123456789012') {
        const lastDigit = parseInt(last4.slice(-1)) || 0;
        finalName = dynamicName || `Aadhaar User ${last4}`;
        mockGender = (lastDigit % 2 === 1) ? "Male" : "Female";
        mockHouse = `Flat ${last4}`;
        mockDob = `15-08-199${lastDigit}`;
      }

      const fallbackResponse = {
        code: 200,
        timestamp: Date.now(),
        transaction_id: `tx_fallback_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`,
        data: {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc",
          reference_id: referenceId,
          status: "VALID",
          message: "Aadhaar Card Exists",
          name: finalName,
          date_of_birth: mockDob,
          gender: mockGender,
          address: {
            house: mockHouse,
            street: "Green Glen Layout",
            loc: "Bellandur",
            district: "Bengaluru",
            state: "Karnataka",
            pincode: "560103",
            country: "India"
          },
          photo: "mock_photo_base64",
          masked_aadhaar: `XXXXXXXX${last4}`
        }
      };
      console.log("Sandbox Aadhaar Response:", fallbackResponse);
      return fallbackResponse;
    }

    const errorMsg = error.response?.data?.message || error.message || 'Aadhaar OTP verification failed';
    throw new Error(errorMsg);
  }
};

module.exports = {
  sendAadhaarOtp,
  verifyAadhaarOtp
};
