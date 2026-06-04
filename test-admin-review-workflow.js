require('dotenv').config();
const mongoose = require('./node_modules/mongoose');
const jwt = require('./node_modules/jsonwebtoken');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loopozone';
const BACKEND_URL = 'http://localhost:5000';
const USER_JWT_SECRET = process.env.JWT_SECRET;

async function run() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.warn('[DB WARNING] Failed to connect to primary database. Falling back to local MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/loopozone');
  }
  console.log('Connected to Database.');

  // Create clean user
  const phone = `+919876${Math.floor(100000 + Math.random() * 900000)}`;
  const email = `verify.admin.${Date.now()}@example.com`;
  const name = 'Compliance Inspector';

  const user = await User.create({
    name,
    email,
    phone,
    sellerType: 'individual',
    isEmailVerified: true
  });
  console.log(`Created User: ID=${user._id}, phone=${phone}, email=${email}`);

  // Generate User JWT Token
  const userToken = jwt.sign({ userId: user._id, phone: user.phone }, USER_JWT_SECRET, { expiresIn: '1d' });

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Login
    // ----------------------------------------------------
    console.log('\n--- [TEST 1] Logging in as Admin ---');
    const adminLoginRes = await fetch(`${BACKEND_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@loopozone.com', password: 'Admin@123456' })
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('Admin login response:', adminLoginData);
    if (adminLoginRes.status !== 200 || !adminLoginData.success || !adminLoginData.token) {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLoginData.token;

    // ----------------------------------------------------
    // TEST 2: Get pending users (record initial count)
    // ----------------------------------------------------
    console.log('\n--- [TEST 2] Fetching initial pending users list ---');
    const pendingRes1 = await fetch(`${BACKEND_URL}/admin/kyc/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingData1 = await pendingRes1.json();
    const initialPendingCount = pendingData1.count || 0;
    console.log('Initial pending users count:', initialPendingCount);

    // ----------------------------------------------------
    // TEST 3: User token on admin route (must fail with 401 or 403)
    // ----------------------------------------------------
    console.log('\n--- [TEST 3] Attempting user token on admin route ---');
    const failAdminRes = await fetch(`${BACKEND_URL}/admin/kyc/pending`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const failAdminData = await failAdminRes.json();
    console.log('User accessing admin route response:', failAdminRes.status, failAdminData);
    if (failAdminRes.status !== 401 && failAdminRes.status !== 403) {
      throw new Error(`Expected access denied (401 or 403), got status: ${failAdminRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 4: Simulate user uploads and auto transition to pending_review
    // ----------------------------------------------------
    console.log('\n--- [TEST 4] Simulating document verification completions on user ---');
    user.aadhaarVerified = true;
    user.panVerified = true;
    user.gstVerified = true;
    user.gstNumber = '29ABCDE1234F1Z5';
    user.selfieImage = '/uploads/selfie/test.jpg';
    user.documents = {
      aadhaar: 'XXXX-XXXX-9999',
      pan: '/uploads/pan/test.jpg',
      gst: '/uploads/gst/test.jpg',
      selfie: '/uploads/selfie/test.jpg'
    };
    await user.save();

    // Call submit endpoint to finalize submission
    console.log('Submitting onboarding verification request...');
    const submitRes = await fetch(`${BACKEND_URL}/kyc/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const submitData = await submitRes.json();
    console.log('Submit response:', submitRes.status, submitData);
    if (submitRes.status !== 200 || !submitData.success) {
      throw new Error('Onboarding submission endpoint failed');
    }

    // ----------------------------------------------------
    // TEST 5: User directed to pending page
    // ----------------------------------------------------
    console.log('\n--- [TEST 5] Checking user KYC status is pending_review ---');
    const statusRes2 = await fetch(`${BACKEND_URL}/kyc/status`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const statusData2 = await statusRes2.json();
    console.log('User status response:', statusData2);
    if (statusData2.kycStatus !== 'pending_review' || statusData2.isKycVerified !== false) {
      throw new Error(`Expected pending_review, got ${statusData2.kycStatus}`);
    }

    // ----------------------------------------------------
    // TEST 6: Admin sees pending user
    // ----------------------------------------------------
    console.log('\n--- [TEST 6] Admin fetching pending list (should increase by 1) ---');
    const pendingRes2 = await fetch(`${BACKEND_URL}/admin/kyc/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingData2 = await pendingRes2.json();
    console.log('New pending users count:', pendingData2.count);
    if (pendingData2.count !== initialPendingCount + 1) {
      throw new Error(`Expected count ${initialPendingCount + 1}, got ${pendingData2.count}`);
    }
    const foundUser = pendingData2.users.find(u => String(u._id) === String(user._id));
    console.log('Found user details in pending list:', foundUser);
    if (!foundUser) {
      throw new Error('Created user was not found in admin pending review list');
    }

    // ----------------------------------------------------
    // TEST 7: Reject without reason (must fail)
    // ----------------------------------------------------
    console.log('\n--- [TEST 7] Attempting to reject user without a reason ---');
    const rejectFailRes = await fetch(`${BACKEND_URL}/admin/kyc/reject/${user._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: '' })
    });
    const rejectFailData = await rejectFailRes.json();
    console.log('Reject without reason response status:', rejectFailRes.status, rejectFailData);
    if (rejectFailRes.status !== 400) {
      throw new Error(`Expected status 400, got ${rejectFailRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 8: Reject with too short reason (must fail)
    // ----------------------------------------------------
    console.log('\n--- [TEST 8] Attempting to reject user with short reason ---');
    const rejectFailRes2 = await fetch(`${BACKEND_URL}/admin/kyc/reject/${user._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'blurry' })
    });
    const rejectFailData2 = await rejectFailRes2.json();
    console.log('Reject short reason response status:', rejectFailRes2.status, rejectFailData2);
    if (rejectFailRes2.status !== 400) {
      throw new Error(`Expected status 400, got ${rejectFailRes2.status}`);
    }

    // ----------------------------------------------------
    // TEST 9: Admin rejects user successfully
    // ----------------------------------------------------
    console.log('\n--- [TEST 9] Rejecting user with detailed reason ---');
    const rejectSuccessRes = await fetch(`${BACKEND_URL}/admin/kyc/reject/${user._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'PAN image is blurry and unreadable' })
    });
    const rejectSuccessData = await rejectSuccessRes.json();
    console.log('Reject success response:', rejectSuccessData);
    if (rejectSuccessRes.status !== 200 || !rejectSuccessData.success) {
      throw new Error(`Rejection failed. Status: ${rejectSuccessRes.status}`);
    }

    // Verify rejection in DB
    const rejectedUser = await User.findById(user._id);
    console.log('Rejected User in DB status:', rejectedUser.kycStatus, 'Reason:', rejectedUser.rejectionReason);
    if (rejectedUser.kycStatus !== 'rejected' || rejectedUser.rejectionReason !== 'PAN image is blurry and unreadable') {
      throw new Error('Database rejection status or reason did not save correctly');
    }

    // ----------------------------------------------------
    // TEST 10: User re-uploads (POST /kyc/reupload)
    // ----------------------------------------------------
    console.log('\n--- [TEST 10] User requesting KYC reset (reupload) ---');
    const reuploadRes = await fetch(`${BACKEND_URL}/kyc/reupload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const reuploadData = await reuploadRes.json();
    console.log('Reupload response:', reuploadData);
    if (reuploadRes.status !== 200 || !reuploadData.success || reuploadData.kycStatus !== 'in_progress') {
      throw new Error(`Reupload reset failed. Status: ${reuploadRes.status}`);
    }

    // Verify fields are reset in DB
    const resetUser = await User.findById(user._id);
    console.log('Reset User details: kycStatus=', resetUser.kycStatus, 'aadhaarVerified=', resetUser.aadhaarVerified, 'panImage=', resetUser.panImage, 'reuploadCount=', resetUser.reuploadCount);
    if (resetUser.kycStatus !== 'in_progress' || resetUser.aadhaarVerified !== false || resetUser.panImage !== null || resetUser.reuploadCount !== 1) {
      throw new Error('Some KYC fields were not reset properly in DB');
    }

    // ----------------------------------------------------
    // TEST 11: Admin Approves user after resubmit
    // ----------------------------------------------------
    console.log('\n--- [TEST 11] Submitting again and Approving ---');
    // Set back to pending_review
    resetUser.kycStatus = 'pending_review';
    await resetUser.save();

    const approveRes = await fetch(`${BACKEND_URL}/admin/kyc/approve/${user._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const approveData = await approveRes.json();
    console.log('Approve response:', approveData);
    if (approveRes.status !== 200 || !approveData.success) {
      throw new Error(`Approve failed. Status: ${approveRes.status}`);
    }

    // Verify approved state in DB
    const approvedUser = await User.findById(user._id);
    console.log('Approved user in DB kycStatus:', approvedUser.kycStatus, 'isKycVerified:', approvedUser.isKycVerified);
    if (approvedUser.kycStatus !== 'approved' || !approvedUser.isKycVerified) {
      throw new Error('Approved status did not apply in database');
    }

    console.log('\n🎉 ALL ADMIN REVIEW KYC SYSTEM LIFECYCLE TESTS PASSED!');

  } finally {
    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log('Cleaned up test database entry.');
    await mongoose.disconnect();
  }
}

run().catch(err => {
  console.error('Test failed with error:', err);
  mongoose.disconnect();
  process.exit(1);
});
