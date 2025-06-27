import { useEffect, useState } from 'react';
import {
  Button,
  Table,
  message,
  Typography,
  Popconfirm,
  Tag,
  Input,
  Space,
  Select,
} from 'antd';
import {
  BellOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAllNotifications,
  purgeReadAndDeletedNotifications,
  deleteAdminNotificationChung,
} from '../../../../api/admin/notificationApi';

const { Title } = Typography;
const { Option } = Select;

const SettingAdmin = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      setNotifications(res.data.data || []);
    } catch {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeNotifications = async () => {
    try {
      const res = await purgeReadAndDeletedNotifications();
      const count = res.data.deletedCount || 0;
      message.success(`Đã xoá ${count} thông báo vĩnh viễn`);
      fetchAllNotifications(); 
    } catch {
      message.error('Lỗi khi xoá thông báo');
    }
  };

  const handleDelete = async (id: string) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?._id || '';

    try {
      await deleteAdminNotificationChung(id, currentUserId);
      message.success('Đã xoá thông báo');
      fetchAllNotifications();
    } catch {
      message.error('Lỗi khi xoá thông báo');
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const filteredData = notifications.filter((item) => {
    const matchText = item.message.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType ? item.type === filterType : true;
    return matchText && matchType;
  });

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format('HH:mm - DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Success', value: 'success' },
        { text: 'Warning', value: 'warning' },
        { text: 'Error', value: 'error' },
        { text: 'Order', value: 'order' },
      ],
      onFilter: (value: any, record: any) => record.type === value,
      render: (type: string) => {
        switch (type) {
          case 'info':
            return <Tag icon={<InfoCircleOutlined />} color="blue">Info</Tag>;
          case 'order':
            return <Tag icon={<CheckCircleOutlined />} color="green">Order</Tag>;
          case 'success':
            return <Tag icon={<CheckCircleOutlined />} color="green">Success</Tag>;
          case 'warning':
            return <Tag icon={<WarningOutlined />} color="orange">Warning</Tag>;
          case 'error':
            return <Tag icon={<CloseCircleOutlined />} color="red">Error</Tag>;
          default:
            return <Tag color="default">Khác</Tag>;
        }
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Xoá thông báo này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xoá"
          cancelText="Huỷ"
        >
          <Button danger type="link" icon={<DeleteOutlined />}>
            Xoá
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow">
      <Title level={3} className="flex items-center gap-3">
        <BellOutlined className="text-blue-600" />
        Quản lý Thông báo Hệ thống
      </Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm theo nội dung..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Lọc theo loại"
          allowClear
          value={filterType}
          onChange={(value) => setFilterType(value)}
          style={{ width: 160 }}
        >
          <Option value="info">Info</Option>
          <Option value="success">Success</Option>
          <Option value="warning">Warning</Option>
          <Option value="error">Error</Option>
          <Option value="order">Order</Option>
        </Select>
        <Popconfirm
          title="Bạn có chắc muốn dọn toàn bộ thông báo đã đọc / đã xoá không?"
          onConfirm={handlePurgeNotifications}
          okText="Dọn dẹp"
          cancelText="Huỷ"
        >
          <Button danger icon={<DeleteOutlined />}>
            Dọn dẹp thông báo
          </Button>
        </Popconfirm>
      </Space>

      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: 'Không có thông báo nào' }}
      />
    </div>
  );
};

export default SettingAdmin;
