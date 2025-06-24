import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Divider,
  List,
  Popover,
  Spin,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { HiBell } from 'react-icons/hi';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from '../../../../api/admin/notificationApi';
import { ApiNotificationItem } from '../../utils/notification';
import { socket } from '../../utils/socket';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
  const userId = adminData?._id || '';

  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("join-user", userId);

    const handleNewNotification = (data: ApiNotificationItem) => {
      setNotifications((prev) => [data, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    fetchNotifications();

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.disconnect(); 
    };
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(userId, 'admin');
      setNotifications(res.data.data || []);
    } catch {
      message.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id, userId);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      message.success('Đã xoá thông báo');
    } catch {
      message.error('Xoá thất bại');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications(userId,'admin');
      setNotifications([]);
      message.success('Đã xoá tất cả thông báo');
    } catch {
      message.error('Xoá tất cả thất bại');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId,'admin');
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      message.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  const handleMarkOneAsRead = async (id: string) => {
    const notification = notifications.find((item) => item._id === id);
    if (!notification || notification.isRead) return;

    try {
      await markOneAsRead(id, userId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      message.success("Đã đánh dấu thành công");
    } catch {
      message.error("Lỗi khi đánh dấu thông báo");
    }
  };

  const navigate = useNavigate();

  const handleClickPromotion = (id: string) => {
    setOpen(false); 
    navigate(`/admin/promotion/detail/${id}`);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const content = (
    <div className="w-[350px] max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <Text strong className="text-base">Thông báo</Text>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Đã đọc tất cả ({unreadCount})
            </Button>
          )}
          {notifications.length > 0 && (
            <Button danger type="text" size="small" onClick={handleDeleteAll}>
              Xoá tất cả
            </Button>
          )}
        </div>
      </div>

      <Divider className="my-2" />

      {loading ? (
        <div className="text-center py-6">
          <Spin />
        </div>
      ) : notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`py-2 px-2 ${
                item.isRead
                  ? 'bg-transparent border-l-[3px] border-transparent'
                  : 'bg-red-50 border-l-[3px] border-red-500'
              }`}
              actions={[
                !item.isRead && (
                  <Button
                    size="small"
                    onClick={() => handleMarkOneAsRead(item._id)}
                  >
                    Đã đọc
                  </Button>
                ),
                <Button
                  danger
                  size="small"
                  type="link"
                  onClick={() => handleDelete(item._id)}
                >
                  Xoá
                </Button>,
              ]}
            >
            <List.Item.Meta
              title={
                <div>
                  <div className="text-sm text-gray-800">
                    {item.relatedId ? (
                      <button
                        onClick={() => handleClickPromotion(item.relatedId)}
                        className="hover:underline text-gray-800 text-left w-full"
                      >
                        {item.message}
                      </button>
                    ) : (
                      <span>{item.message}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dayjs(item.createdAt).format('HH:mm - DD/MM/YYYY')}
                  </div>
                </div>
              }
            />
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary" className="block text-center mt-2">
          Không có thông báo
        </Text>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={(visible) => setOpen(visible)}
      placement="bottomRight"
    >
      <Badge
        count={unreadCount}
        size="small"
        offset={[-2, 2]}
        className={unreadCount > 0 ? 'animate-ping-slow' : ''}
      >
        <Tooltip title='Thông báo'>
          <Button
            shape="circle"
            icon={<HiBell size={20} />}
            className="hover:bg-gray-100"
          />
        </Tooltip>
      </Badge>
    </Popover>
  );
}
