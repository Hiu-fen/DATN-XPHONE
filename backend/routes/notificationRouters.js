const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationControllers');

router.get('/', notificationController.getNotificationsByUser);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markOneAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
