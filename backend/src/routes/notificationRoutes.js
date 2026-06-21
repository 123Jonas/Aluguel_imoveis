const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Rotas específicas antes das parametrizadas
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllNotificationsAsRead);

router.get('/', notificationController.getUserNotifications);
router.delete('/', notificationController.deleteAllNotifications);

router.patch('/:id/read', notificationController.markNotificationAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
