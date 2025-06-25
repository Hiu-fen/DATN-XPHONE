import { useEffect, useState } from 'react';
import {
  Button,
  List,
  message,
  Typography,
  Popconfirm,
  Spin,
  Empty,
} from 'antd';
import dayjs from 'dayjs';
import { BellOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllNotifications, purgeReadAndDeletedNotifications } from '../../../../api/admin/notificationApi';

const { Title } = Typography;

const SettingAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeNotifications = async () => {
    try {
      await purgeReadAndDeletedNotifications();
      message.success('Đã xoá thông báo đã đọc / đã bị xoá');
      fetchAllNotifications(); 
    } catch (err) {
      message.error('Lỗi khi xoá thông báo');
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <Title level={3} className="flex items-center gap-3">
        <BellOutlined className="text-blue-600" />
        Quản lý Thông báo Hệ thống
      </Title>

      <div className="my-4">
        <Popconfirm
          title="Bạn có chắc muốn dọn toàn bộ thông báo đã đọc / đã xoá không?"
          onConfirm={handlePurgeNotifications}
          okText="Dọn dẹp"
          cancelText="Huỷ"
        >
          <Button danger icon={<DeleteOutlined />}>
            Dọn dẹp thông báo đã đọc / đã xoá
          </Button>
        </Popconfirm>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="Không có thông báo nào" className="my-10" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          bordered
          pagination={{ pageSize: 5 }}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={<strong>{item.message}</strong>}
                description={dayjs(item.createdAt).format('HH:mm - DD/MM/YYYY')}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SettingAdmin;
