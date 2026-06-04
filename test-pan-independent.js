const mongoose = require('./node_modules/mongoose');
const jwt = require('./node_modules/jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('./node_modules/dotenv').config();
const User = require('./src/models/User');

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loopozone');
  console.log('Connected to DB.');

  const testPhone = `+919999${Math.floor(100000 + Math.random() * 900000)}`;
  const testEmail = `test.${Date.now()}@example.com`;
  const testName = `Separation Test User`;

  console.log(`Creating test user (Aadhaar is NOT verified)...`);
  const user = await User.create({
    name: testName,
    email: testEmail,
    phone: testPhone
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1d'
  });
  console.log('Generated JWT token.');

  const realImagePath = 'c:/Users/SnehaN/Loopozone/uploads/pan/panImage-1780125631461-628414499.png';
  if (!fs.existsSync(realImagePath)) {
    console.error(`PAN image not found at ${realImagePath}!`);
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
    return;
  }

  // Helper to construct FormData
  const createForm = (pan, includeFile = true) => {
    const form = new FormData();
    form.append('pan', pan);
    if (includeFile) {
      const fileBuffer = fs.readFileSync(realImagePath);
      form.append('panImage', new Blob([fileBuffer], { type: 'image/png' }), 'pan_card.png');
    }
    return form;
  };

  // Test 1: No image uploaded
  console.log('\n--- Test 1: No image uploaded ---');
  try {
    const res = await fetch('http://localhost:5000/kyc/pan/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pan: 'ODZPS8086J' })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', body);
    if (res.status === 400 && body.error === 'PAN card image is required') {
      console.log('✅ Test 1 Passed!');
    } else {
      console.error('❌ Test 1 Failed!');
    }
  } catch (err) {
    console.error('Test 1 crashed:', err.message);
  }

  // Test 2: Wrong PAN format
  console.log('\n--- Test 2: Wrong PAN format ---');
  try {
    const form = createForm('ABC123');
    const res = await fetch('http://localhost:5000/kyc/pan/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', body);
    if (res.status === 400 && body.error === 'Invalid PAN format. Example: ABCDE1234F') {
      console.log('✅ Test 2 Passed!');
    } else {
      console.error('❌ Test 2 Failed!');
    }
  } catch (err) {
    console.error('Test 2 crashed:', err.message);
  }

  // Test 3: PAN mismatch (type wrong PAN)
  console.log('\n--- Test 3: PAN mismatch (type wrong PAN) ---');
  try {
    const form = createForm('AAAAA1111A');
    const res = await fetch('http://localhost:5000/kyc/pan/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', body);
    if (res.status === 400 && body.error === 'PAN number mismatch') {
      console.log('✅ Test 3 Passed!');
    } else {
      console.error('❌ Test 3 Failed!');
    }
  } catch (err) {
    console.error('Test 3 crashed:', err.message);
  }

  // Test 4: Everything correct (succeeds without Aadhaar verified!)
  console.log('\n--- Test 4: Everything correct (matching PAN and image) ---');
  try {
    const form = createForm('ODZPS8086J');
    const res = await fetch('http://localhost:5000/kyc/pan/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', body);
    if (res.status === 200 && body.success === true) {
      console.log('✅ Test 4 Passed!');
    } else {
      console.error('❌ Test 4 Failed!');
    }
  } catch (err) {
    console.error('Test 4 crashed:', err.message);
  }

  // Clean up
  await User.deleteOne({ _id: user._id });
  console.log('\nCleaned up test user.');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Runner crashed:', err);
  mongoose.disconnect();
});
