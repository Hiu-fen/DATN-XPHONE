import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Button, message, Tag, Tooltip } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IContact } from '../../../interface/contact';
import { ArrowLeftOutlined } from '@ant-design/icons';

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  if (loading) {
    return <Spin size="large" className="block mx-auto my-40" />;
  }

  if (!contact) {
    return <p className="text-center text-red-500 font-semibold">Không tìm thấy liên hệ.</p>;
  }

  return (
    <div className="mx-auto">
      <Card
        title={
          <div className="text-blue-500 ">
            Chi tiết liên hệ
          </div>
        }
        extra={
          <Tooltip title="Quay lại">
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
          </Tooltip>
        }
        className="shadow-md"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Họ tên">{contact.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{contact.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{contact.phone}</Descriptions.Item>
          <Descriptions.Item label="Nội dung">{contact.message}</Descriptions.Item>
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
    </div>
  );
};

export default ContactDetail;
