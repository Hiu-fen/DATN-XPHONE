const Notification = require('../models/notificationModels');
const User = require('../models/userModels'); 

// Lấy thông báo user
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

// [GET] /api/notifications/user/unread-count?userId=...
exports.getUnreadUserNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });

    const count = await Notification.countDocuments({
      $or: [{ userId }, { role: 'user' }, { scope: 'global' }],
      deletedBy: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ message: 'Số thông báo chưa đọc', count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Phần của admin
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

exports.getUnreadAdminNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    const count = await Notification.countDocuments({
      $or: [{ role: 'admin' }, { scope: 'global' }],
      deletedBy: { $ne: userId },
      readBy: { $ne: userId },
    });

    res.status(200).json({ message: 'Số thông báo chưa đọc', count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
exports.purgeReadAndDeletedNotifications = async (req, res) => {
  try {
    // Lấy tất cả thông báo mà mọi người đều đã đọc và đã xóa
    const notifications = await Notification.find();

    const toDelete = notifications.filter(n => {
      const allRead = n.readBy.length > 0;  // hoặc kiểm tra số lượng readBy >= số user (tùy logic)
      const allDeleted = n.deletedBy.length > 0;
      return allRead && allDeleted;
    });

    const idsToDelete = toDelete.map(n => n._id);
    await Notification.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({ message: `Đã xoá ${idsToDelete.length} thông báo vĩnh viễn` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





