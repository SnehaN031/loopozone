const express = require('express');
const userController = require('../controllers/userController');
const { protect, requireKyc } = require('../middleware/verifyJWT');

const router = express.Router();

router.get('/profile', protect, userController.getProfile);
router.get('/dashboard', protect, requireKyc, userController.getDashboardData);

module.exports = router;
