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
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAllNotifications,
  purgeReadAndDeletedNotifications,
  deleteAdminNotificationChung,
  countReadOrDeletedNotifications,
} from '../../../../api/admin/notificationApi';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Option } = Select;

const NotificationAdmin
 = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [purgeCount, setPurgeCount] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const res = await getAllNotifications();
      setNotifications(res.data.data || []);
    } catch {
      message.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurgeCount = async () => {
    try {
      const res = await countReadOrDeletedNotifications();
      setPurgeCount(res.data.count || 0);
    } catch {
      message.error('Không thể đếm số thông báo cần dọn');
    }
  };

  const handlePurgeNotifications = async () => {
    try {
      const res = await purgeReadAndDeletedNotifications();
      const count = res.data.deletedCount || 0;
      message.success(`Đã xoá ${count} thông báo vĩnh viễn`);
      setSelectedRowKeys([]);
      fetchAllNotifications();
    } catch {
      message.error('Lỗi khi xoá thông báo');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Hãy chọn ít nhất 1 thông báo để xoá');
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          deleteAdminNotificationChung(id as string, 'admin')
        )
      );
      message.success(`Đã xoá ${selectedRowKeys.length} thông báo`);
      setSelectedRowKeys([]);
      fetchAllNotifications();
      fetchPurgeCount();
    } catch {
      message.error('Lỗi khi xoá thông báo');
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    fetchPurgeCount();
  }, []);

  const filteredData = notifications.filter((item) => {
    const matchText = item.message
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchType =
      filterType === 'all' ? true : item.type === filterType;
    return matchText && matchType;
  });

  // 🟢 Điều hướng dựa trên loại thông báo
  const handleNotificationClick = (item: any) => {
    if (!item.relatedId) {
      message.info('Thông báo này không có liên kết chi tiết');
      return;
    }

    switch (item.type) {
      case 'order':
        navigate(`/admin/orders/${item.relatedId}`);
        break;
      case 'product':
        navigate(`/admin/product/detail/${item.relatedId}`);
        break;
      case 'promotion':
        navigate(`/admin/promotion/detail/${item.relatedId}`);
        break;
      case 'user':
        navigate(`/admin/user/detail/${item.relatedId}`);
        break;
      default:
        message.info('Loại thông báo này chưa được hỗ trợ điều hướng');
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      render: (_: string, record: any) => (
        <span
          onClick={() => handleNotificationClick(record)}
          className={`${
            record.relatedId
              ? 'cursor-pointer text-blue-600 hover:underline'
              : 'cursor-not-allowed'
          }`}
        >
          {record.message}
        </span>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'userId',
      key: 'userId',
      render: (_: any, record: any) => (
        <Text type="secondary">
          {record.role === 'admin'
            ? 'Admin'
            : record.userId && record.userId.name
            ? record.userId.name
            : 'Hệ thống'}
        </Text>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        dayjs(value).format('HH:mm - DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        switch (type) {
          case 'info':
            return (
              <Tag icon={<InfoCircleOutlined />} color="blue">
                Bình thường
              </Tag>
            );
          case 'order':
          case 'success':
            return (
              <Tag icon={<CheckCircleOutlined />} color="green">
                {type === 'order' ? 'Đơn hàng' : 'Thành công'}
              </Tag>
            );
          case 'warning':
            return (
              <Tag icon={<WarningOutlined />} color="orange">
                Cảnh báo
              </Tag>
            );
          case 'error':
            return (
              <Tag icon={<CloseCircleOutlined />} color="red">
                Lỗi
              </Tag>
            );
          case 'product':
            return (
              <Tag icon={<ShoppingOutlined />} color="purple">
                Sản phẩm
              </Tag>
            );
          case 'promotion':
            return (
              <Tag icon={<InfoCircleOutlined />} color="pink">
                Khuyến mãi
              </Tag>
            );
          default:
            return <Tag color="default">Khác</Tag>;
        }
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* 🟢 Header tiêu đề */}
      <Space className="flex justify-between w-full mb-4" align="center">
        <h2 className="text-blue-600 text-3xl font-semibold mb-6">
          Quản lý thông báo hệ thống
        </h2>
        <Text className="text-gray-500">
          Tổng cộng: <b>{notifications.length}</b> thông báo
        </Text>
      </Space>

      {/* 🟢 Thanh công cụ tìm kiếm và bộ lọc */}
      <Space
        style={{ marginBottom: 16 }}
        wrap
        className="flex justify-between w-full"
      >
        <Space>
          <Input
            placeholder="Tìm theo nội dung..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-[250px]"
          />

          <Select
            value={filterType}
            onChange={setFilterType}
            className="w-[180px]"
          >
            <Option value="all">Tất cả loại</Option>
            <Option value="info">Bình thường</Option>
            <Option value="order">Đơn hàng</Option>
            <Option value="success">Thành công</Option>
            <Option value="warning">Cảnh báo</Option>
            <Option value="product">Sản phẩm</Option>
            <Option value="promotion">Khuyến mãi</Option>
            <Option value="error">Lỗi</Option>
          </Select>
        </Space>

        {/* 🟢 Các nút thao tác */}
        <Space>
          <Popconfirm
            title={
              purgeCount > 0
                ? `Có ${purgeCount} thông báo đã đọc / đã xoá mềm. Bạn có chắc muốn dọn dẹp không?`
                : 'Hiện không có thông báo nào cần dọn'
            }
            onConfirm={handlePurgeNotifications}
            okText="Dọn dẹp"
            cancelText="Huỷ"
            disabled={purgeCount === 0}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={purgeCount === 0}
            >
              Dọn dẹp thông báo
            </Button>
          </Popconfirm>

          <Popconfirm
            title={`Bạn có chắc muốn xoá ${selectedRowKeys.length} thông báo đã chọn không?`}
            onConfirm={handleBulkDelete}
            okText="Xoá"
            cancelText="Huỷ"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              type="primary"
              disabled={selectedRowKeys.length === 0}
              icon={<DeleteOutlined />}
            >
              Xoá đã chọn
            </Button>
          </Popconfirm>
        </Space>
      </Space>

      {/* 🟢 Bảng hiển thị dữ liệu */}
      <Table
        rowSelection={rowSelection}
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: 'Không có thông báo nào',
        }}
      />
    </div>
  );
};

export default NotificationAdmin;
