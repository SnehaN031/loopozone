const express = require('express');
const verifyAdmin = require('../middleware/verifyAdmin');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Secure all notification endpoints using Admin token check
router.use(verifyAdmin);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
