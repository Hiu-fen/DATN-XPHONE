import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Button, message, Tag, Tooltip, Modal, Form, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { IContact, IMessage } from '../../../interface/contact';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  const fetchContactDetail = async () => {
    try {
      setConnectionError(false);
      const response = await axios.get(`http://localhost:5000/api/contacts/${id}`);
      setContact(response.data);
      setLoading(false);
    } catch (error) {
      const axiosError = error as AxiosError;
      message.error('Không thể tải chi tiết liên hệ! Vui lòng kiểm tra kết nối mạng.');
      console.error('Lỗi tải chi tiết liên hệ:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      setConnectionError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetail();

    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server:', socketInstance.id);
      setConnectionError(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Lỗi kết nối Socket.IO:', error);
      message.error('Không thể kết nối tới server Socket.IO. Vui lòng kiểm tra kết nối mạng!');
      setConnectionError(true);
    });

    socketInstance.on('contactUpdated', (updatedContact: IContact) => {
      if (updatedContact._id === id) {
        setContact(updatedContact);
        message.info('Thông tin liên hệ đã được cập nhật!');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [id]);

  const handleReply = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setConnectionError(false);

      const response = await axios.patch(`http://localhost:5000/api/contacts/${id}/reply`, {
        content: values.replyMessage,
      });

      setContact(response.data);
      message.success('Phản hồi tin nhắn thành công!');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể gửi phản hồi! Vui lòng kiểm tra kết nối mạng.';
      message.error(errorMessage);
      console.error('Lỗi khi gửi phản hồi:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  if (loading) {
    return <Spin size="large" className="block mx-auto my-40" />;
  }

  if (!contact) {
    return <p className="text-center text-red-500 font-semibold">Không tìm thấy liên hệ.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card
        title={<div className="text-blue-500 text-2xl font-bold">Chi tiết liên hệ</div>}
        extra={
            <div className="flex gap-2">
              <Tooltip title="Phản hồi">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setIsModalOpen(true)}
                disabled={connectionError}
              >
                Phản hồi
              </Button>
            </Tooltip>
            <Tooltip title="Quay lại">
              <Button
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                disabled={connectionError}
              />
            </Tooltip>
          </div>
        }
        className="shadow-md"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Họ tên">{contact.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{contact.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{contact.phone}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{contact.conversation[0]?.content || 'Chưa có mô tả'}</Descriptions.Item>
          <Descriptions.Item label="Ngày gửi">
            {contact.conversation[0]?.timestamp || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {new Date(contact.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={contact.status ? 'green' : 'red'}>
              {contact.status ? 'Đã xử lý' : 'Chưa xử lý'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-blue-500 mb-4">Lịch sử trò chuyện</h3>
          {connectionError && (
            <p className="text-center text-red-500 mb-4">Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng!</p>
          )}
          <div className="max-h-[60vh] overflow-y-auto">
            {contact.conversation.map((msg: IMessage, index: number) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    msg.sender === 'client' ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                >
                  <p className="font-semibold">{msg.sender === 'client' ? contact.name : 'Admin'}</p>
                  <p>{msg.content}</p>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Message"
                      className="mt-2 max-w-full h-auto"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        title="Phản hồi liên hệ"
        open={isModalOpen}
        onOk={handleReply}
        onCancel={handleModalCancel}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="replyMessage"
            label="Thông tin phản hồi"
            rules={[{ required: true, message: 'Vui lòng nhập thông tin phản hồi!' }]}
          >
            <TextArea rows={4} placeholder="Nhập thông tin phản hồi" disabled={connectionError} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactDetail;