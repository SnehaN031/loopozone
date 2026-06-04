const jwtHelper = require('../utils/jwtHelper');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.warn(`[AUTH WARNING] Blocked request to ${req.method} ${req.originalUrl} - No token provided.`);
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwtHelper.verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.warn(`[AUTH WARNING] Blocked request to ${req.method} ${req.originalUrl} - User with ID ${decoded.userId} no longer exists.`);
        return res.status(401).json({ success: false, error: 'User no longer exists.' });
      }
      req.user = user;
      next();
    } catch (err) {
      console.warn(`[AUTH WARNING] Blocked request to ${req.method} ${req.originalUrl} - Invalid or expired token. Error: ${err.message}`);
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
  } catch (error) {
    next(error);
  }
};

const requireKyc = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (!req.user.isKycVerified) {
    return res.status(403).json({ success: false, error: 'KYC Onboarding incomplete', redirect: '/kyc' });
  }
  next();
};

const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwtHelper.verifyToken(token);
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Access denied. Admins only.' });
      }
      req.admin = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  requireKyc,
  protectAdmin
};
