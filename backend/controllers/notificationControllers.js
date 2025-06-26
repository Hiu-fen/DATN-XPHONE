const Notification = require('../models/notificationModels');
const User = require('../models/userModels'); 
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Hiển thị thông báo
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });

    const notis = await Notification.find({
      $or: [{ userId }, { scope: 'user' }, { scope: 'global' }],
      deletedBy: { $ne: userId }
    }).sort({ createdAt: -1 });

    const data = notis.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.includes(userId),
    }));

    res.status(200).json({ message: 'Lấy thông báo user thành công', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo thông báo khi đăng nhập
exports.createNotificationForUser = async (req, res) => {
  try {
    const { userId, message, type = 'info' } = req.body;
    if (!userId || !message) return res.status(400).json({ message: 'Thiếu thông tin' });

    const user = await User.findById(userId);
    if (!user || user.role !== 'user') return res.status(403).json({ message: 'Admin không đăng nhập được nhé, dùng tài khoản user đi ae!' });

    const noti = await Notification.create({ userId, message, type, role: 'user' });
    res.status(201).json({ message: 'Tạo thông báo user thành công', data: noti });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu mềm đã đọc
exports.markOneUserNotificationAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: userId } });
    res.status(200).json({ message: 'Đã đánh dấu đã đọc' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu mềm tất cả đã đọc
exports.markAllUserNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const notis = await Notification.find({
      $or: [{ userId }, { scope: 'user' }, { scope: 'global' }],
      readBy: { $ne: userId }
    });
    await Promise.all(notis.map(n => Notification.findByIdAndUpdate(n._id, { $addToSet: { readBy: userId } })));
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa mềm 
exports.deleteUserNotification = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { $addToSet: { deletedBy: userId } });
    res.status(200).json({ message: 'Đã xoá thông báo (mềm)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa tất cả mềm
exports.deleteAllUserNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const notis = await Notification.find({
      $or: [{ userId }, { scope: 'user' }, { scope: 'global' }],
      deletedBy: { $ne: userId }
    });
    await Promise.all(notis.map(n => Notification.findByIdAndUpdate(n._id, { $addToSet: { deletedBy: userId } })));
    res.status(200).json({ message: `Đã xóa ${notis.length} thông báo` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tính số thông báo chưa đọc + xóa mềm
exports.getUnreadUserNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });

    const count = await Notification.countDocuments({
      $or: [
        { userId, role: 'user' },
        { scope: { $in: ['user', 'global'] }, role: 'user' },
      ],
      deletedBy: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ message: 'Số thông báo chưa đọc', count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Phần của admin
// Hiển thị thông báo
exports.getAdminNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    const notifications = await Notification.find({
      $or: [
        { userId, role: 'admin' },
        { scope: { $in: ['admin', 'global'] }, role: 'admin' }
      ],
      deletedBy: { $ne: userId },
    }).sort({ createdAt: -1 });

    const result = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(userId),
    }));

    res.status(200).json({ message: 'Lấy thông báo thành công', data: result });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

// Tạo thông báo khi đăng nhập
exports.createNotificationForAdmin = async (req, res) => {
  try {
    const { userId, message, type = 'info' } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'Thiếu userId hoặc message' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ tạo thông báo cho tài khoản admin' });
    }

    const notification = await Notification.create({
      userId,
      message,
      type,
      role: 'admin',
    });

    res.status(201).json({ message: 'Tạo thông báo admin thành công', data: notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu mềm đã đọc 
exports.markOneAdminNotificationAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: userId } });
    res.status(200).json({ message: 'Đã đánh dấu đã đọc (admin)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu mềm tất cả đã đọc
exports.markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const notis = await Notification.find({
      $or: [{ userId }, { scope: 'admin' }, { scope: 'global' }],
      readBy: { $ne: userId }
    });
    await Promise.all(notis.map(n => Notification.findByIdAndUpdate(n._id, { $addToSet: { readBy: userId } })));
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc (admin)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa mềm 
exports.deleteAdminNotification = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { $addToSet: { deletedBy: userId } });
    res.status(200).json({ message: 'Đã xoá thông báo (admin)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa tất cả mềm
exports.deleteAllAdminNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const notis = await Notification.find({
      $or: [{ userId }, { scope: 'admin' }, { scope: 'global' }],
      deletedBy: { $ne: userId }
    });
    await Promise.all(notis.map(n => Notification.findByIdAndUpdate(n._id, { $addToSet: { deletedBy: userId } })));
    res.status(200).json({ message: `Đã xóa ${notis.length} thông báo (admin)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tính số thông báo chưa đọc + xóa mềm
exports.getUnreadAdminNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });

    const count = await Notification.countDocuments({
      $or: [
        { userId, role: 'admin' },
        { scope: { $in: ['admin', 'global'] }, role: 'admin' },
      ],
      deletedBy: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ message: 'Số thông báo chưa đọc', count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xử lý chung
const MAX_NOTIFICATIONS = 60;

exports.getAllNotifications = async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });

    if (data.length >= MAX_NOTIFICATIONS) {
      const existingWarning = await Notification.findOne({
        message: { $regex: 'có.*thông báo.*dọn dẹp', $options: 'i' },
        type: 'warning',
        scope: 'admin',
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
      });

      if (!existingWarning) {
        const admins = await User.find({ role: 'admin' });

        await Promise.all(
          admins.map(admin =>
            Notification.create({
              userId: admin._id,
              message: `Hệ thống có ${data.length} thông báo - cần dọn dẹp`,
              type: 'warning',
              role: 'admin',
              scope: 'admin',
            })
          )
        );
      }
    }

    res.status(200).json({ message: 'Lấy tất cả thông báo', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Xóa cứng tất cả thông báo đã đọc + đã bị xóa mềm
// Xóa cứng tất cả thông báo đã đọc + đã bị xóa mềm
exports.purgeReadAndDeletedNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();

    // Xác định thông báo có ÍT NHẤT 1 người đã đọc hoặc đã xoá
    const toDelete = notifications.filter(n => {
      const readCount = Array.isArray(n.readBy) ? n.readBy.length : 0;
      const deletedCount = Array.isArray(n.deletedBy) ? n.deletedBy.length : 0;

      return readCount >= 1 || deletedCount >= 1; 
    });

    const idsToDelete = toDelete.map(n => n._id);
    await Notification.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({
      message: `Đã xoá ${idsToDelete.length} thông báo vĩnh viễn`,
      deletedCount: idsToDelete.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa cứng 1 thông báo
exports.deleteOneNotificationHard = async (req, res) => {
  try {
    const { id } = req.params;
    const noti = await Notification.findById(id);

    if (!noti) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xoá thông báo thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





