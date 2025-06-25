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
  getAdminNotifications,
  deleteAdminNotification,
  deleteAllAdminNotifications,
  markOneAdminNotiAsRead,
  markAllAdminNotiAsRead,
  getAdminUnreadCount,
} from '../../../../api/admin/notificationApi';
import { ApiNotificationItem } from '../../utils/notification';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import {
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { FaEye, FaTrashAlt } from 'react-icons/fa';

const { Text } = Typography;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
  const userId = adminData?._id || '';

  const isRead = (item: ApiNotificationItem) =>
  item.readBy.some((id) => id.toString() === userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications(userId);
      setNotifications(res.data.data || []);
    } catch {
      message.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const { data } = useQuery({
    queryKey: ['unread-admin', userId],
    queryFn: () => getAdminUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminNotification(id, userId);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      message.success('Đã xoá thông báo');
    } catch {
      message.error('Xoá thất bại');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllAdminNotifications(userId);
      setNotifications([]);
      message.success('Đã xoá tất cả thông báo');
    } catch {
      message.error('Xoá tất cả thất bại');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotiAsRead(userId);
      const updated = notifications.map((n) => {
        const alreadyRead = n.readBy.some((id) => id.toString() === userId);
        return {
          ...n,
          readBy: alreadyRead ? n.readBy : [...n.readBy, userId],
        };
      });
      setNotifications(updated);
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      message.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  const handleMarkOneAsRead = async (id: string) => {
    const notification = notifications.find((item) => item._id === id);
    if (!notification || notification.readBy.includes(userId)) return;

    try {
      await markOneAdminNotiAsRead(id, userId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, readBy: [...item.readBy, userId] }
            : item
        )
      );
      message.success('Đã đánh dấu thành công');
    } catch {
      message.error('Lỗi khi đánh dấu thông báo');
    }
  };

  const navigate = useNavigate();

  const handleClickPromotion = (id: string) => {
    setOpen(false);
    navigate(`/admin/promotion/detail/${id}`);
  };

  const unreadCount = data?.data?.count ?? 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'approval':
        return <WarningOutlined className="text-yellow-500" />;
      case 'system':
        return <InfoCircleOutlined className="text-blue-500" />;
      case 'product':
        return <CheckCircleOutlined className="text-purple-500" />;
      case 'info':
        return <InfoCircleOutlined className="text-cyan-500" />;
      case 'error':
        return <WarningOutlined className="text-red-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const content = (
    <div className="w-[400px] max-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <Text strong className="text-base">Thông báo</Text>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Đã đọc tất cả 
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
              className={`py-3 px-3 rounded-md transition ${
                isRead(item)
                  ? 'bg-white border-l-[3px] border-transparent'
                  : 'bg-red-50 border-l-[3px] border-red-500'
              }`}
              actions={[
                !isRead(item) && (
                  <Tooltip title="Đánh dấu đã đọc" key="read">
                    <Button
                      size="small"
                      icon={<FaEye />}
                      onClick={() => handleMarkOneAsRead(item._id)}
                    />
                  </Tooltip>
                ),
                <Tooltip title="Xoá thông báo" key="delete">
                  <Button
                    danger
                    size="small"
                    type="text"
                    icon={<FaTrashAlt />}
                    onClick={() => handleDelete(item._id)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2">
                      <span className="mt-[2px]">{getIcon(item.type)}</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 font-medium">
                          {item.relatedId ? (
                            <button
                              onClick={() => handleClickPromotion(item.relatedId)}
                              className="hover:underline text-left w-full"
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
        <Tooltip title="Thông báo">
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