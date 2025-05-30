import  { useEffect, useState } from 'react';
import { Table, Button, message, Input, Popconfirm } from 'antd';
import axios from 'axios';
import { IContact } from '../../../interface/contact';
import { DeleteOutlined } from '@ant-design/icons';

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]); 
  const [searchText, setSearchText] = useState('');
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

  const search = contacts?.filter((c: IContact) => {
    const Text = ` ${c.email} ${c.name} ${c.date} ${c.phone} ${c.message}  `.toLowerCase();
    return Text.includes(searchText.toLowerCase());
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
          onClick={() => toggleStatus(record._id, record.status)}
          style={{ marginRight: 8 }}
        >
          {record.status ? 'Đánh dấu chưa xử lý' : 'Đánh dấu đã xử lý'}
        </Button>
        <Popconfirm
          title="Thông báo"
          description="Bạn chắc chắn muốn xóa?"
          icon={<DeleteOutlined />}
          onConfirm={() => deleteContact(record._id)}
          okText="OK"
          cancelText="NO"
        >
          <Button danger>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      </span>
    ),
  },
];


  return (
    <div >
      <h2 className="text-2xl font-bold ">Danh sách liên hệ</h2>
       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Input.Search
        placeholder=""
        className="mb-4"
         style={{ width: 300 }} 
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
       </div>
      
      <Table
        columns={columns}
        dataSource={search}
        rowKey="_id"
        pagination={{
        pageSize: 10, 
        showSizeChanger: false,
        pageSizeOptions: ['5', '10', '20'],
      }}
      />
    </div>
  );
};

export default ContactList;
