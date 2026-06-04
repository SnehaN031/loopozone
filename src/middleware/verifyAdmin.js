const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No admin token provided'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const admin = await Admin.findById(decoded.adminId)
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Admin account not found or disabled'
      })
    }

    req.admin = { adminId: decoded.adminId, email: admin.email, role: 'admin' }
    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired admin token'
    })
  }
}

module.exports = verifyAdmin
