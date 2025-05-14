import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IContact } from '../../../interface/contact';

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);  // State lưu trữ danh sách liên hệ
  const navigate = useNavigate();

  // Hàm để lấy danh sách liên hệ từ API hoặc localStorage
  const fetchContacts = async () => {
    try {
      // Dữ liệu từ backend
      const response = await axios.get('http://localhost:4000/contacts');
      setContacts(response.data);  // Lưu dữ liệu vào state
    } catch (error) {
      message.error('Không thể tải danh sách liên hệ, vui lòng thử lại!');
    }
  };

  // Sử dụng useEffect để gọi hàm fetch khi component được render
  useEffect(() => {
    fetchContacts();
  }, []);

  // Hàm xử lý thay đổi trạng thái
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.patch(`http://localhost:4000/contacts/${id}`, { status: updatedStatus });
      // Cập nhật lại danh sách sau khi thay đổi trạng thái
      setContacts((prevContacts) => prevContacts.map(contact => 
        contact.id === id ? { ...contact, status: updatedStatus } : contact
      ));
      message.success('Thay đổi trạng thái thành công!');
    } catch (error) {
      message.error('Không thể thay đổi trạng thái, vui lòng thử lại!');
    }
  };

  // Hàm xử lý xóa liên hệ
  const deleteContact = async (id: number) => {
    try {
      await axios.delete(`http://localhost:4000/contacts/${id}`);
      // Xoá liên hệ khỏi danh sách trong state
      setContacts((prevContacts) => prevContacts.filter(contact => contact.id !== id));
      message.success('Xoá liên hệ thành công!');
    } catch (error) {
      message.error('Không thể xoá liên hệ, vui lòng thử lại!');
    }
  };

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
    },
     {
      title: 'Ngày gửi',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (status ? 'Đã xử lý' : 'Chưa xử lý'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IContact) => (
        <span>
          <Button 
            onClick={() => toggleStatus(record.id, record.status)} 
            style={{ marginRight: 8 }}>
            {record.status ? 'Đánh dấu chưa xử lý' : 'Đánh dấu đã xử lý'}
          </Button>
          <Button onClick={() => deleteContact(record.id)} danger> 
            Xoá
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="container mt-10">
      <h2 className="text-2xl font-bold mb-6">Danh sách liên hệ</h2>
      <Table
        columns={columns}
        dataSource={contacts}
        rowKey="id"
      />
    </div>
  );
};

export default ContactList;
