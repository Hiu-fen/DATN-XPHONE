import { useEffect, useState } from 'react';
import { Table, Button, message, Input, Tooltip, Tag } from 'antd';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { IContact } from '../../../interface/contact';
import { EyeOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts');
      console.log('Danh sách liên hệ đã tải:', response.data);
      setContacts(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách liên hệ, vui lòng thử lại!');
      console.error('Lỗi tải danh sách liên hệ:', error);
    }
  };

  useEffect(() => {
    fetchContacts();

    // Khởi tạo Socket.IO
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
        const newContacts = [...prevContacts, newContact];
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
        const newContacts = prevContacts.map((contact) =>
          contact._id === updatedContact._id ? updatedContact : contact
        );
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

  const handleEmailClick = (email: string) => {
    const subject = encodeURIComponent('Re: Liên hệ từ XPhone Store');
    const body = encodeURIComponent(
      `Xin chào Bạn \n\nCảm ơn bạn đã liên hệ với XPhone Store. Chúng tôi đã nhận được phản hồi của bạn.\n\n Nội dung :  \n\nTrân trọng,\nXPhone Store\nTừ: xphonene53@gmail.com`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleViewInbox = () => {
    const gmailUrl = 'https://mail.google.com';
    window.open(gmailUrl, '_blank');
  };

  const filteredContacts = contacts.filter((c: IContact) => {
    const text = `${c.email} ${c.name} ${c.phone}`.toLowerCase();
    console.log('Lọc liên hệ:', c, 'Từ khóa tìm kiếm:', searchText);
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
      render: (email: string) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleEmailClick(email);
          }}
          className="text-blue-600 hover:underline"
        >
          {email}
        </a>
      ),
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
    )
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
          <Tooltip title="Xem hộp thư">
            <Button
              icon={<MailOutlined />}
              onClick={handleViewInbox}
            />
          </Tooltip>
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