const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isKycVerified: user.isKycVerified
      },
      metrics: {
        investmentBalance: '₹1,24,500.00',
        portfolioYield: '+12.4%',
        activeAssets: 3
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getDashboardData
};
