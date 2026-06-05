const Notification = require('../models/Notification');

// GET /user/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'USER',
      userId: req.user.id
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientType: 'USER',
      userId: req.user.id,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// PUT /user/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientType: 'USER', userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// PUT /user/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientType: 'USER', userId: req.user.id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /user/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientType: 'USER',
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
