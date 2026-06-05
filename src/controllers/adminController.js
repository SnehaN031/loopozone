const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const User = require('../models/User')

// POST /admin/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, error: 'Admin account is disabled' })
    }

    const token = jwt.sign(
      { adminId: admin._id, role: 'admin' },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.status(200).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    next(error)
  }
}

// GET /admin/kyc/pending
const getPendingUsers = async (req, res, next) => {
  try {
    console.log(`[DEBUG] [ADMIN] Fetching pending KYC users list... Requested by Admin ID: ${req.admin ? req.admin.adminId : 'unknown'}`);
    const users = await User.find(
      { kycStatus: 'pending_review' },
      '_id name phone email sellerType aadhaarVerified panVerified gstVerified selfieImage panImage gstImage aadhaarNumber panNumber gstNumber createdAt kycStatus'
    ).sort({ createdAt: 1 })

    console.log(`[DEBUG] [ADMIN] Found ${users.length} user(s) pending KYC review.`);
    if (users.length > 0) {
      users.forEach((u, i) => {
        console.log(`  ${i + 1}. User ID: ${u._id} | Name: ${u.name} | Phone: ${u.phone} | SellerType: ${u.sellerType}`);
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    })

  } catch (error) {
    next(error)
  }
}

// GET /admin/kyc/user/:userId
const getUserDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = await User.findById(
      userId,
      '_id name phone email sellerType kycStatus createdAt aadhaarVerified aadhaarNumber aadhaarData panVerified panNumber panImage gstVerified gstNumber gstImage selfieImage reuploadCount'
    ).lean()

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    // Generate dynamic credentials from user data
    const dynamicUsername = user.email ? user.email.split('@')[0] : user.name.toLowerCase().replace(/\s+/g, '_');
    const dynamicPassword = `${dynamicUsername}_password_${user.phone ? user.phone.slice(-2) : '99'}`;

    const userObj = {
      ...user,
      username: dynamicUsername,
      password: dynamicPassword
    };

    return res.status(200).json({
      success: true,
      user: userObj
    })

  } catch (error) {
    next(error)
  }
}

// POST /admin/kyc/approve/:userId
const approveKYC = async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.kycStatus === 'approved' || user.kycStatus === 'verified' || user.isKycVerified) {
      return res.status(400).json({ success: false, error: 'User is already approved' })
    }

    user.kycStatus = 'approved'
    user.isKycVerified = true
    user.rejectionReason = null
    user.reviewedAt = new Date()
    user.reviewedBy = req.admin.adminId

    await user.save()

    // Create user notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'KYC Verified Successfully',
        message: 'Congratulations, your KYC has been verified. You can now start trading!',
        type: 'KYC_APPROVED',
        recipientType: 'USER',
        userId: user._id
      });
      console.log(`[NOTIFICATION] Generated KYC approved notification for user: ${user.phone}`);
    } catch (notifErr) {
      console.warn('[NOTIFICATION WARNING] Failed to create KYC approval notification:', notifErr.message);
    }

    const dynamicUsername = user.email ? user.email.split('@')[0] : user.name.toLowerCase().replace(/\s+/g, '_');
    const dynamicPassword = `${dynamicUsername}_password_${user.phone ? user.phone.slice(-2) : '99'}`;

    return res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        isKycVerified: user.isKycVerified,
        username: dynamicUsername,
        password: dynamicPassword,
        aadhaarNumber: user.aadhaarNumber || 'N/A',
        panNumber: user.panNumber || 'N/A'
      }
    })

  } catch (error) {
    next(error)
  }
}

// POST /admin/kyc/reject/:userId
const rejectKYC = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required' })
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a detailed reason' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.kycStatus === 'rejected') {
      return res.status(400).json({ success: false, error: 'User is already rejected' })
    }

    user.kycStatus = 'rejected'
    user.isKycVerified = false
    user.rejectionReason = reason.trim()
    user.reviewedAt = new Date()
    user.reviewedBy = req.admin.adminId

    await user.save()

    // Create user notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'KYC Verification Failed',
        message: `Your KYC submission was rejected. Reason: ${user.rejectionReason}. Please re-upload corrected documents.`,
        type: 'KYC_REJECTED',
        recipientType: 'USER',
        userId: user._id
      });
      console.log(`[NOTIFICATION] Generated KYC rejected notification for user: ${user.phone}`);
    } catch (notifErr) {
      console.warn('[NOTIFICATION WARNING] Failed to create KYC rejection notification:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'KYC rejected',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        kycStatus: user.kycStatus,
        rejectionReason: user.rejectionReason
      }
    })

  } catch (error) {
    next(error)
  }
}

// GET /admin/kyc/all
const getAllUsers = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) {
      filter.kycStatus = req.query.status
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    })

  } catch (error) {
    next(error)
  }
}

// POST /admin/create
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' })
    }

    const newAdmin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    })

    await newAdmin.save()

    return res.status(201).json({
      success: true,
      message: 'Admin created',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    })

  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  getPendingUsers,
  getUserDocuments,
  approveKYC,
  rejectKYC,
  getAllUsers,
  createAdmin
}
