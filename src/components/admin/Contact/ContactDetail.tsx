import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Button, message, Tag, Tooltip, Modal, Form, Upload, DatePicker } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { IContact } from '../../../interface/contact';
import { ArrowLeftOutlined, CheckCircleOutlined, EyeOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { RcFile } from 'antd/es/upload';

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchContactDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/contacts/${id}`);
      setContact(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Không thể tải chi tiết liên hệ!');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetail();

    // Initialize Socket.IO
    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server:', socketInstance.id);
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

  const uploadImage = async (file: RcFile) => {
    setLoading(true);
    const formData = new FormData();
    const publicId = `contact_reply_${id}_${Date.now()}`;
    formData.append('file', file);
    formData.append('upload_preset', 'datn-xphone');

    try {
      console.log('Uploading to Cloudinary:', { publicId, file });
      const { data } = await axios.post('https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.secure_url);
      message.success('Tải ảnh xác nhận thành công');
      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary error:', error.response?.data);
      message.error(error.response?.data?.error?.message || 'Lỗi upload ảnh lên Cloudinary');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReply = async () => {
    try {
      await form.validateFields();
      if (!imageUrl) {
        message.error('Vui lòng chọn và tải lên hình ảnh xác nhận!');
        return;
      }

      setLoading(true);
      const replyDate = form.getFieldValue('replyDate').format('DD/MM/YYYY HH:mm');

      const response = await axios.patch(`http://localhost:5000/api/contacts/${id}`, {
        status: true,
        replyImage: imageUrl,
        replyDate,
      });

      setContact(response.data);
      message.success('Xác nhận đã phản hồi thành công!');
      setIsModalOpen(false);
      form.resetFields();
      setImageUrl(null);
    } catch (error: any) {
      message.error(error.message || 'Không thể xác nhận phản hồi, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setImageUrl(null);
  };

  const handleViewReply = () => {
    setIsViewModalOpen(true);
  };

  const handleFullScreenImage = () => {
    setIsFullScreenModalOpen(true);
  };

  const uploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/');
      const isLt5MB = file.size / 1024 / 1024 < 5;
      console.log('File selected:', { file, isImage, isLt5MB });

      if (!isImage) {
        message.error('Vui lòng chỉ tải lên file hình ảnh!');
        return false;
      }
      if (!isLt5MB) {
        message.error('Hình ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      uploadImage(file);
      return false;
    },
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
        title={
          <div className="text-blue-500 text-2xl font-bold">
            Chi tiết liên hệ
          </div>
        }
        extra={
          <div className="flex gap-2">
            {contact.status && (
              <Tooltip title="Xem phản hồi">
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handleViewReply}
                >
                  Xem phản hồi
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Xác nhận đã phản hồi">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setIsModalOpen(true)}
                disabled={contact.status}
              >
                Xác nhận đã phản hồi
              </Button>
            </Tooltip>
            <Tooltip title="Quay lại">
              <Button
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
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
          <Descriptions.Item label="Ngày gửi">
            {contact.date || 'Chưa cập nhật'}
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
      </Card>

      <Modal
        title="Xác nhận đã phản hồi"
        open={isModalOpen}
        onOk={handleConfirmReply}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="replyImage"
            label="Hình ảnh xác nhận (vui lòng chụp toàn màn hình)"
            rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh xác nhận!' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                style={{ marginTop: 8, maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
              />
            )}
          </Form.Item>
          <Form.Item
            name="replyDate"
            label="Thời gian, ngày phản hồi"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian phản hồi!' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian phản hồi"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thông tin phản hồi"
        open={isViewModalOpen}
        onOk={() => setIsViewModalOpen(false)}
        onCancel={() => setIsViewModalOpen(false)}
        okText="Đóng"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <strong>Thời gian phản hồi:</strong> {contact.replyDate || 'Chưa cập nhật'}
          </div>
          <div>
            <strong>Hình ảnh xác nhận:</strong>
            {contact.replyImage ? (
              <img
                src={contact.replyImage}
                alt="Hình ảnh xác nhận"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', cursor: 'pointer' }}
                onClick={handleFullScreenImage}
              />
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title="Xem ảnh toàn màn hình"
        open={isFullScreenModalOpen}
        onCancel={() => setIsFullScreenModalOpen(false)}
        footer={null}
        centered
        width="90%"
        style={{ maxWidth: '1200px' }}
        bodyStyle={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
      >
        {contact.replyImage && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={contact.replyImage}
              alt="Full-screen reply image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxHeight: '80vh',
              }}
            />
            <Button
              icon={<CloseOutlined />}
              onClick={() => setIsFullScreenModalOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
              }}
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactDetail;