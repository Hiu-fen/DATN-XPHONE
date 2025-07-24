import { useEffect, useState } from 'react';
import { Table, Button, message, Input, Popconfirm, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { IContact } from '../../../interface/contact';
import { DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts');
      setContacts(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách liên hệ, vui lòng thử lại!');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.patch(`http://localhost:5000/api/contacts/${id}`, { status: updatedStatus });
      setContacts(prev =>
        prev.map(contact => contact._id === id ? { ...contact, status: updatedStatus } : contact)
      );
      message.success('Thay đổi trạng thái thành công!');
    } catch (error) {
      message.error('Không thể thay đổi trạng thái, vui lòng thử lại!');
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      message.success('Xoá liên hệ thành công!');
    } catch (error) {
      message.error('Không thể xoá liên hệ, vui lòng thử lại!');
    }
  };

  const filteredContacts = contacts.filter((c: IContact) => {
    const text = `${c.email} ${c.name} ${c.phone} ${c.message}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
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
        <div className="flex gap-2">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/contact/detail/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title={record.status ? 'Đánh dấu chưa xử lý' : 'Đánh dấu đã xử lý'}>
            <Button
              icon={record.status ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => toggleStatus(record._id, record.status)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => deleteContact(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xoá liên hệ">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4 text-green-600">Danh sách liên hệ</h2>
      <div className="flex justify-end mb-4">
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
