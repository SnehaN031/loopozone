const express = require('express');
const userController = require('../controllers/userController');
const { protect, requireKyc } = require('../middleware/verifyJWT');

const router = express.Router();

router.get('/profile', protect, userController.getProfile);
router.post('/switch-role', protect, userController.switchRole);
router.put('/profile', protect, userController.updateProfile);
router.put('/notifications/preferences', protect, userController.updateNotificationPreferences);
router.post('/wallet/add-money', protect, userController.addWalletFunds);
router.post('/wallet/withdraw', protect, userController.withdrawWalletFunds);
router.get('/dashboard', protect, requireKyc, userController.getDashboardData);

module.exports = router;
