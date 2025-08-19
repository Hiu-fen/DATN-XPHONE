import { useEffect, useState } from 'react';
import {
  List,
  Tag,
  Tooltip,
  Button,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  BellOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiNotificationItem } from '../../../admin/utils/notification';
import {
  deleteAllUserNotifications,
  deleteUserNotification,
  getUserNotifications,
  getUserUnreadCount,
  markAllUserNotiAsRead,
  markOneUserNotiAsRead,
} from '../../../../api/client/nofitationApiClient';

const Notification = () => {
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData?._id || '';

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getUserNotifications(userId);
      setNotifications(res.data.data || []);
    } catch (err) {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const { data } = useQuery({
    queryKey: ['unread-count', userId],
    queryFn: () => getUserUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markOneUserNotiAsRead(id, userId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, readBy: [...item.readBy, userId] }
            : item
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['unread-count', userId],
      });
      message.success('Đã đánh dấu là đã đọc');
    } catch {
      message.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUserNotification(id, userId);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      queryClient.invalidateQueries({
        queryKey: ['unread-count', userId],
      });
      message.success('Đã xoá thông báo');
    } catch {
      message.error('Xoá thất bại');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllUserNotiAsRead(userId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.readBy?.includes(userId)
            ? item
            : { ...item, readBy: [...item.readBy, userId] }
        )
      );
      queryClient.invalidateQueries({
        queryKey: ['unread-count', userId],
      });
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      message.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllUserNotifications(userId);
      setNotifications([]);
      queryClient.invalidateQueries({
        queryKey: ['unread-count', userId],
      });
      message.success('Đã xoá tất cả thông báo');
    } catch {
      message.error('Không thể xoá tất cả');
    }
  };

  const getNotificationLink = (note: ApiNotificationItem) => {
    switch (note.type) {
      case 'order':
        return `/history/${note.relatedId}`;
      case 'product':
        return `/detail/${note.relatedId}`;
      default:
        return '#';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'product':
        return <ShoppingOutlined className="text-purple-500" />;
      case 'info':
        return <InfoCircleOutlined className="text-cyan-500" />;
      case 'error':
        return <WarningOutlined className="text-red-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const unreadCount = data?.data?.count ?? 0;

  return (
    <div className="py-8 px-4 mx-auto">
      <h2 className="text-blue-600 text-3xl font-semibold mb-6">
        Trung tâm thông báo
      </h2>

      <div className="flex gap-3 mt-2 mb-6">
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={handleMarkAllAsRead}
          disabled={notifications.every((n) => n.readBy?.includes(userId))}
        >
          Đánh dấu tất cả là đã đọc ({unreadCount})
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteAll}
          disabled={notifications.length === 0}
        >
          Xoá tất cả thông báo
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-20">
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="Không có thông báo nào" className="my-20" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
          renderItem={(note) => (
            <List.Item
              className={`rounded-lg px-5 py-4 border border-gray-200 transition duration-300 ease-in-out ${note.readBy?.includes(userId)
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-blue-50 hover:bg-blue-100'
                }`}
              actions={[
                !note.readBy?.includes(userId) && (
                  <Tooltip title="Đánh dấu đã đọc" key="read">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleMarkAsRead(note._id)}
                    />
                  </Tooltip>
                ),
                <Tooltip title="Xoá thông báo" key="delete">
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(note._id)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={<div className="text-2xl mt-1">{getIcon(note.type)}</div>}
                title={
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium">
                      {note.type === 'order'
                        ? 'Đơn hàng'
                        : note.type === 'product'
                          ? 'Sản phẩm'
                          : 'Thông báo'}
                    </span>
                    <Tag
                      color={note.readBy?.includes(userId) ? 'success' : 'processing'}
                      className="text-xs px-2"
                    >
                      {note.readBy?.includes(userId) ? 'Đã đọc' : 'Chưa đọc'}
                    </Tag>
                  </div>
                }
                description={
                  <div className="text-base text-gray-700">
                    <Link
                      to={getNotificationLink(note)}
                      className="hover:underline text-blue-600"
                    >
                      {note.message}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      {dayjs(note.createdAt).format('HH:mm - DD/MM/YYYY')}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Notification;
