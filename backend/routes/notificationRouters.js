// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const noti = require('../controllers/notificationControllers');

// Dành cho user
router.get('/user', noti.getUserNotifications);
router.get('/user/unread-count', noti.getUnreadUserNotificationCount);
router.post('/user', noti.createNotificationForUser);
router.patch('/user/:id/read', noti.markOneUserNotificationAsRead);
router.patch('/user/read-all', noti.markAllUserNotificationsAsRead);
router.delete('/user/:id', noti.deleteUserNotification);
router.delete('/user', noti.deleteAllUserNotifications);

// Dành cho admin
router.get('/admin', noti.getAdminNotifications);
router.get('/admin/unread-count', noti.getUnreadAdminNotificationCount);
router.post('/admin', noti.createNotificationForAdmin);
router.patch('/admin/:id/read', noti.markOneAdminNotificationAsRead);
router.patch('/admin/read-all', noti.markAllAdminNotificationsAsRead);
router.delete('/admin/:id', noti.deleteAdminNotification);
router.delete('/admin', noti.deleteAllAdminNotifications);

// Xử lý chung
router.get('/all', noti.getAllNotifications);
router.get('/count-read-deleted', noti.countReadOrDeletedNotifications);
router.delete('/purge-read-deleted', noti.purgeReadAndDeletedNotifications);
router.delete('/:id', noti.deleteOneNotificationHard); 

module.exports = router;
