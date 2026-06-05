const User = require('../models/User');

// GET /user/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v -refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /user/switch-role
const switchRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Toggle role
    const oldRole = user.role || 'seller';
    const newRole = oldRole === 'seller' ? 'buyer' : 'seller';
    user.role = newRole;

    // Log recent activity
    user.recentActivity.push({
      title: 'Role Switched',
      description: `Successfully switched role from ${oldRole} to ${newRole}.`,
      timestamp: new Date()
    });

    // Keep activities capped to latest 10
    if (user.recentActivity.length > 10) {
      user.recentActivity.shift();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Role switched successfully to ${newRole}`,
      role: user.role,
      recentActivity: user.recentActivity
    });
  } catch (error) {
    next(error);
  }
};

// PUT /user/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, languagePreference, savedAddresses } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (languagePreference) user.languagePreference = languagePreference;
    if (savedAddresses) user.savedAddresses = savedAddresses;

    user.recentActivity.push({
      title: 'Profile Updated',
      description: 'Account settings details updated successfully.',
      timestamp: new Date()
    });

    if (user.recentActivity.length > 10) user.recentActivity.shift();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// PUT /user/notifications/preferences
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { 
      emailNotifications, 
      smsNotifications, 
      pushNotifications, 
      orderUpdates, 
      walletUpdates, 
      promotionalUpdates 
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.notificationPreferences) {
      if (emailNotifications !== undefined) user.notificationPreferences.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined) user.notificationPreferences.smsNotifications = smsNotifications;
      if (pushNotifications !== undefined) user.notificationPreferences.pushNotifications = pushNotifications;
      if (orderUpdates !== undefined) user.notificationPreferences.orderUpdates = orderUpdates;
      if (walletUpdates !== undefined) user.notificationPreferences.walletUpdates = walletUpdates;
      if (promotionalUpdates !== undefined) user.notificationPreferences.promotionalUpdates = promotionalUpdates;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

// POST /user/wallet/add-money
const addWalletFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid deposit amount is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.wallet.balance += Number(amount);
    user.wallet.totalEarnings += Number(amount);

    user.recentActivity.push({
      title: 'Wallet Deposited',
      description: `Added ₹${amount} to wallet balance.`,
      timestamp: new Date()
    });

    if (user.recentActivity.length > 10) user.recentActivity.shift();

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully deposited ₹${amount}`,
      wallet: user.wallet,
      recentActivity: user.recentActivity
    });
  } catch (error) {
    next(error);
  }
};

// POST /user/wallet/withdraw
const withdrawWalletFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid withdrawal amount is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    user.wallet.balance -= Number(amount);
    user.wallet.withdrawnAmount += Number(amount);

    user.recentActivity.push({
      title: 'Funds Withdrawn',
      description: `Withdrew ₹${amount} from wallet to bank details.`,
      timestamp: new Date()
    });

    if (user.recentActivity.length > 10) user.recentActivity.shift();

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully withdrew ₹${amount}`,
      wallet: user.wallet,
      recentActivity: user.recentActivity
    });
  } catch (error) {
    next(error);
  }
};

// Keeping getDashboardData for backward compatibility with previous dashboard requirements
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
        investmentBalance: `₹${user.wallet.balance.toLocaleString('en-IN')}`,
        portfolioYield: '+12.4%',
        activeAssets: user.ordersSummary.total
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  switchRole,
  updateProfile,
  updateNotificationPreferences,
  addWalletFunds,
  withdrawWalletFunds,
  getDashboardData
};
