const Notification = require('../models/notificationModels');
const { getIO } = require('../socket');

// [GET] /api/notifications?userId=...&role=...
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId || !role) return res.status(400).json({ message: 'Thiếu userId hoặc role' });

    const notifications = await Notification.find({
      $or: [
        { userId },
        { scope: role },
        { scope: 'global' },
      ],
      deletedBy: { $ne: userId } // Không lấy những cái đã xóa bởi user này
    }).sort({ createdAt: -1 });

    // Gắn thêm trạng thái isRead cho FE
    const result = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(userId),
    }));

    res.status(200).json({ message: 'Lấy thông báo thành công', data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [POST] /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if (!userId || !message) return res.status(400).json({ message: 'Thiếu userId hoặc message' });

    const notification = await Notification.create({ userId, message, type });

    const io = getIO();
    io.to(userId).emit('new_notification', notification);

    res.status(201).json({ message: 'Tạo thông báo thành công', data: notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/notifications/:id/read?userId=...
exports.markOneAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId || !id) return res.status(400).json({ message: 'Thiếu userId hoặc id' });

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId } // không trùng
    });

    res.status(200).json({ message: 'Đánh dấu đã đọc thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/notifications/read-all?userId=...&role=...
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId || !role) return res.status(400).json({ message: 'Thiếu userId hoặc role' });

    const notifications = await Notification.find({
      $or: [{ userId }, { scope: role }, { scope: 'global' }],
      readBy: { $ne: userId }
    });

    const updatePromises = notifications.map(n =>
      Notification.findByIdAndUpdate(n._id, {
        $addToSet: { readBy: userId }
      })
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [DELETE] /api/notifications/:id?userId=...
exports.deleteNotification = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ message: 'Thiếu userId hoặc id' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa' });
    }

    res.status(200).json({ message: 'Đã xoá thông báo (mềm)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [DELETE] /api/notifications?userId=...&role=...
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ message: 'Thiếu userId hoặc role' });
    }

    const notifications = await Notification.find({
      $or: [
        { userId },
        { scope: role },
        { scope: 'global' }
      ],
      deletedBy: { $ne: userId }
    });

    const updateTasks = notifications.map(n =>
      Notification.findByIdAndUpdate(n._id, {
        $addToSet: { deletedBy: userId }
      })
    );

    await Promise.all(updateTasks);

    res.status(200).json({ message: `Đã xoá ${notifications.length} thông báo (mềm)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


