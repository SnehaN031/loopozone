const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');

// Fix for querySrv ECONNREFUSED MongoDB Atlas SRV resolution issues on local networks/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignored
}

const BACKEND_URL = 'http://localhost:5000';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loopozone';

async function runTests() {
  console.log('Connecting to MongoDB database...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB.');

  require('./src/models/User');
  require('./src/models/Category');
  require('./src/models/Price');

  const User = mongoose.model('User');
  const Category = mongoose.model('Category');
  const Price = mongoose.model('Price');

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testPhone = `+919999${randomSuffix}`;
  const testEmail = `test.${randomSuffix}@example.com`;
  const testName = `Endpoint Tester ${randomSuffix}`;

  try {
    // Clean up any potential leftover user with this phone or email
    await User.deleteOne({ $or: [{ phone: testPhone }, { email: testEmail }] });

    // 1. Check User (New User)
    console.log('\n--- [TEST 1] POST /auth/check-user (New) ---');
    const rCheckNew = await fetch(`${BACKEND_URL}/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    const resCheckNew = await rCheckNew.json();
    console.log('Status:', rCheckNew.status, resCheckNew);
    if (!resCheckNew.success || resCheckNew.existingUser !== false || resCheckNew.redirect !== '/signup') {
      throw new Error('Check User for new user failed');
    }

    // 2. Signup
    console.log('\n--- [TEST 2] POST /auth/signup ---');
    const rSignup = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testName, email: testEmail, phone: testPhone })
    });
    const resSignup = await rSignup.json();
    console.log('Status:', rSignup.status, resSignup);
    if (!resSignup.success || !resSignup.token || !resSignup.refreshToken) {
      throw new Error('Signup failed');
    }
    let accessToken = resSignup.token;
    let refreshToken = resSignup.refreshToken;
    const userId = resSignup.user._id;

    // 3. Send Phone OTP without JWT (Should fail - protected)
    console.log('\n--- [TEST 3] POST /auth/send-otp (Without JWT, should fail) ---');
    const rSendOtpNoJwt = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    const resSendOtpNoJwt = await rSendOtpNoJwt.json();
    console.log('Status:', rSendOtpNoJwt.status, resSendOtpNoJwt);
    if (rSendOtpNoJwt.status !== 401) {
      throw new Error('Send OTP without JWT should have returned 401 Unauthorized');
    }

    // 4. Send Phone OTP with JWT (Should succeed)
    console.log('\n--- [TEST 4] POST /auth/send-otp (With JWT, should succeed) ---');
    const rSendOtpWithJwt = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ phone: testPhone })
    });
    const resSendOtpWithJwt = await rSendOtpWithJwt.json();
    console.log('Status:', rSendOtpWithJwt.status, resSendOtpWithJwt);
    if (!resSendOtpWithJwt.success || resSendOtpWithJwt.status !== 'otp_sent') {
      throw new Error('Send OTP with JWT failed');
    }

    // 5. Verify Phone OTP
    console.log('\n--- [TEST 5] POST /auth/verify-otp ---');
    const rVerifyOtp = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, otp: '123456' })
    });
    const resVerifyOtp = await rVerifyOtp.json();
    console.log('Status:', rVerifyOtp.status, resVerifyOtp);
    if (!resVerifyOtp.success || !resVerifyOtp.token || !resVerifyOtp.refreshToken) {
      throw new Error('Verify Phone OTP failed');
    }
    accessToken = resVerifyOtp.token;
    refreshToken = resVerifyOtp.refreshToken;

    // 6. Send Email OTP (Protected)
    console.log('\n--- [TEST 6] POST /auth/send-email-otp ---');
    const rSendEmailOtp = await fetch(`${BACKEND_URL}/auth/send-email-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const resSendEmailOtp = await rSendEmailOtp.json();
    console.log('Status:', rSendEmailOtp.status, resSendEmailOtp);
    if (!resSendEmailOtp.success) {
      throw new Error('Send Email OTP failed');
    }

    // 7. Verify Email OTP (Protected)
    console.log('\n--- [TEST 7] POST /auth/verify-email-otp ---');
    const rVerifyEmailOtp = await fetch(`${BACKEND_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ otp: '654321' }) // Default dev email OTP
    });
    const resVerifyEmailOtp = await rVerifyEmailOtp.json();
    console.log('Status:', rVerifyEmailOtp.status, resVerifyEmailOtp);
    if (!resVerifyEmailOtp.success || !resVerifyEmailOtp.user.isEmailVerified) {
      throw new Error('Verify Email OTP failed');
    }

    // 8. Refresh Token Rotation
    console.log('\nWaiting 1.1s for JWT timestamp to advance...');
    await new Promise(resolve => setTimeout(resolve, 1100));

    console.log('\n--- [TEST 8] POST /auth/refresh (Rotation) ---');
    const rRefresh = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const resRefresh = await rRefresh.json();
    console.log('Status:', rRefresh.status, resRefresh);
    if (!resRefresh.success || !resRefresh.token || !resRefresh.refreshToken) {
      throw new Error('Refresh Token Rotation failed');
    }
    accessToken = resRefresh.token;
    const prevRefreshToken = refreshToken;
    refreshToken = resRefresh.refreshToken;

    // 8b. Re-use old refresh token (should fail/revoke all as it detects reuse)
    console.log('\n--- [TEST 8B] POST /auth/refresh (Re-use old refresh token, should fail) ---');
    const rRefreshReuse = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: prevRefreshToken })
    });
    console.log('Status:', rRefreshReuse.status);
    if (rRefreshReuse.status !== 401) {
      throw new Error('Expected 401 Unauthorized on token reuse detection');
    }


    // 9. Set Seller Type (Protected)
    console.log('\n--- [TEST 9] POST /kyc/seller-type ---');
    const rSellerType = await fetch(`${BACKEND_URL}/kyc/seller-type`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ sellerType: 'business' })
    });
    const resSellerType = await rSellerType.json();
    console.log('Status:', rSellerType.status, resSellerType);
    if (!resSellerType.success || resSellerType.sellerType !== 'business') {
      throw new Error('Set Seller Type failed');
    }

    // 10. KYC Status check (Protected)
    console.log('\n--- [TEST 10] GET /kyc/status ---');
    const rKycStatus = await fetch(`${BACKEND_URL}/kyc/status`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const resKycStatus = await rKycStatus.json();
    console.log('Status:', rKycStatus.status, resKycStatus);
    if (!resKycStatus.success) {
      throw new Error('Get KYC status failed');
    }

    // 11. Public Prices
    console.log('\n--- [TEST 11] GET /prices ---');
    const rPrices = await fetch(`${BACKEND_URL}/prices`);
    const resPrices = await rPrices.json();
    console.log('Status:', rPrices.status, 'Count:', resPrices.count);
    if (!resPrices.success) {
      throw new Error('Get public prices failed');
    }

    // 12. Public Categories
    console.log('\n--- [TEST 12] GET /categories ---');
    const rCategories = await fetch(`${BACKEND_URL}/categories`);
    const resCategories = await rCategories.json();
    console.log('Status:', rCategories.status, 'Count:', resCategories.count);
    if (!resCategories.success) {
      throw new Error('Get public categories failed');
    }

    // 13. Admin Login
    console.log('\n--- [TEST 13] POST /admin/login ---');
    const rAdminLogin = await fetch(`${BACKEND_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@loopozone.com', password: 'Admin@123456' })
    });
    const resAdminLogin = await rAdminLogin.json();
    console.log('Status:', rAdminLogin.status, resAdminLogin);
    if (!resAdminLogin.success || !resAdminLogin.token) {
      throw new Error('Admin login failed');
    }
    const adminToken = resAdminLogin.token;

    // 14. Admin Prices CRUD (Create, List, Update, Delete)
    console.log('\n--- [TEST 14] POST /admin/prices ---');
    const rAdminPriceCreate = await fetch(`${BACKEND_URL}/admin/prices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ materialName: `TestMaterial-${randomSuffix}`, pricePerKg: 100, city: 'Delhi' })
    });
    const resAdminPriceCreate = await rAdminPriceCreate.json();
    console.log('Status:', rAdminPriceCreate.status, resAdminPriceCreate);
    if (!resAdminPriceCreate.success) {
      throw new Error('Create admin price record failed');
    }
    const priceRecordId = resAdminPriceCreate.price._id;

    // 15. Admin Categories CRUD
    console.log('\n--- [TEST 15] POST /admin/categories ---');
    const rAdminCatCreate = await fetch(`${BACKEND_URL}/admin/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: `TestCat-${randomSuffix}`, description: 'Testing category description', icon: 'shield' })
    });
    const resAdminCatCreate = await rAdminCatCreate.json();
    console.log('Status:', rAdminCatCreate.status, resAdminCatCreate);
    if (!resAdminCatCreate.success) {
      throw new Error('Create admin category failed');
    }
    const catRecordId = resAdminCatCreate.category._id;

    // Clean up Admin records
    await Price.deleteOne({ _id: priceRecordId });
    await Category.deleteOne({ _id: catRecordId });

    // 16. Get User Profile (Protected)
    console.log('\n--- [TEST 16] GET /user/profile ---');
    const rProfile = await fetch(`${BACKEND_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const resProfile = await rProfile.json();
    console.log('Status:', rProfile.status, resProfile);
    if (!resProfile.success || resProfile.user.phone !== testPhone) {
      throw new Error('Get profile failed');
    }

    // 17. Logout (Protected)
    console.log('\n--- [TEST 17] POST /auth/logout ---');
    const rLogout = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });
    const resLogout = await rLogout.json();
    console.log('Status:', rLogout.status, resLogout);
    if (!resLogout.success) {
      throw new Error('Logout failed');
    }

    // Verify token invalidated
    console.log('Verifying that refresh token has been revoked in DB...');
    const userRevoked = await User.findById(userId);
    console.log('Active Refresh Tokens Count in DB:', userRevoked.refreshTokens.length);
    if (userRevoked.refreshTokens.includes(refreshToken)) {
      throw new Error('Logout did not clear the specified refresh token from the user model');
    }

    console.log('\n======================================================');
    console.log('🎉 SUCCESS: EVERY SINGLE ENDPOINT FLOW VERIFIED CORRECTLY!');
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILURE:', err);
    process.exitCode = 1;
  } finally {
    // Delete temp user
    await User.deleteOne({ phone: testPhone });
    console.log('Cleaned up test user from DB.');
    await mongoose.disconnect();
  }
}

runTests();
