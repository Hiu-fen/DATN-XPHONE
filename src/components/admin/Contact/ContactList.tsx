import { useEffect, useState } from 'react';
import { Table, Button, message, Input, Tooltip, Tag, Select } from 'antd';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { IContact } from '../../../interface/contact';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unprocessed' | 'processed'>('all');
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts');
      const sortedContacts = response.data.sort((a: IContact, b: IContact) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log('Danh sách liên hệ đã tải:', sortedContacts);
      setContacts(sortedContacts);
    } catch (error) {
      message.error('Không thể tải danh sách liên hệ, vui lòng thử lại!');
      console.error('Lỗi tải danh sách liên hệ:', error);
    }
  };

  useEffect(() => {
    fetchContacts();

    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Kết nối với server Socket.IO:', socketInstance.id);
    });

    socketInstance.on('contactCreated', (newContact: IContact) => {
      console.log('Nhận sự kiện contactCreated:', newContact);
      setContacts((prevContacts) => {
        if (prevContacts.some((contact) => contact._id === newContact._id)) {
          console.log('Liên hệ đã tồn tại, không thêm:', newContact._id);
          return prevContacts;
        }
        const newContacts = [newContact, ...prevContacts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('Danh sách liên hệ sau khi thêm:', newContacts);
        return newContacts;
      });
      message.info(`Liên hệ mới: ${newContact.name}`);
    });

    socketInstance.on('contactUpdated', (updatedContact: IContact) => {
      console.log('Nhận sự kiện contactUpdated:', updatedContact);
      setContacts((prevContacts) => {
        const exists = prevContacts.some((contact) => contact._id === updatedContact._id);
        console.log('Liên hệ tồn tại trong danh sách:', exists);
        const newContacts = prevContacts
          .map((contact) => (contact._id === updatedContact._id ? updatedContact : contact))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('Danh sách liên hệ sau khi cập nhật:', newContacts);
        return newContacts;
      });
      message.info(`Liên hệ ${updatedContact.name} đã được cập nhật!`);
    });

    socketInstance.on('disconnect', () => {
      console.log('Ngắt kết nối với server Socket.IO');
    });

    return () => {
      console.log('Ngắt kết nối Socket.IO');
      socketInstance.disconnect();
    };
  }, []);

  const filteredContacts = contacts.filter((c: IContact) => {
    const text = `${c.email} ${c.name} ${c.phone} ${c.conversation[0]?.content || ''}`.toLowerCase();
    const matchesSearch = text.includes(searchText.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'unprocessed') return matchesSearch && !c.status;
    if (filterType === 'processed') return matchesSearch && c.status;
    return false;
  });

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: IContact, index: number) => index + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Mô tả',
      key: 'mota',
      render: (record: IContact) => record.conversation[0]?.content || 'Chưa có mô tả',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Đã xử lý' : 'Chưa xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IContact) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/contact/detail/${record._id}`)}
          >
            Xem chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4 text-green-600">Danh sách liên hệ</h2>
      <div className="flex justify-end mb-4 gap-4">
        <Select
          value={filterType}
          onChange={(value) => setFilterType(value)}
          className="w-48"
        >
          <Option value="all">Tất cả</Option>
          <Option value="unprocessed">Chưa xử lý</Option>
          <Option value="processed">Đã xử lý</Option>
        </Select>
        <Input.Search
          placeholder="Tìm kiếm liên hệ..."
          className="w-72"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredContacts}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} liên hệ`,
        }}
        locale={{ emptyText: 'Chưa có liên hệ nào' }}
      />
    </div>
  );
};

export default ContactList;