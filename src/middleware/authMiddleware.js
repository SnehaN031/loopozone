const jwtHelper = require('../utils/jwtHelper');
const User = require('../models/User');

const protect = async (req, res, next) => {
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
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'User no longer exists.' });
      }
      req.user = user;
      next();
    } catch (err) {
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

module.exports = {
  protect,
  requireKyc
};
