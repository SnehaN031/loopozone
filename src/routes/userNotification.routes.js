const express = require('express');
const { protect } = require('../middleware/verifyJWT');
const userNotificationController = require('../controllers/userNotificationController');

const router = express.Router();

// Secure all user notification endpoints using user token check
router.use(protect);

router.get('/', userNotificationController.getNotifications);
router.put('/read-all', userNotificationController.markAllAsRead);
router.put('/:id/read', userNotificationController.markAsRead);
router.delete('/:id', userNotificationController.deleteNotification);

module.exports = router;
