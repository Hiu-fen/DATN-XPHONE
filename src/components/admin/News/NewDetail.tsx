import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminNewsById } from '../../../api/admin/newAdmin';
import { INews } from '../../../interface/News';
import {
  Spin,
  Tag,
  Button,
  Descriptions,
  Image,
  Tooltip,
  Card,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const NewsDetailAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Fetch news detail
  const { data, isLoading, isError } = useQuery<INews>({
    queryKey: ['news', id],
    queryFn: async () => {
      const response = await getAdminNewsById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 font-semibold text-lg">
        Không thể tải dữ liệu tin tức.
      </div>
    );
  }

  const renderStatus = (status: boolean) =>
    status ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Ẩn</Tag>;

  return (
    <div className="mt-4 mx-auto border rounded bg-white shadow-lg">
      <Card
        title={<span className="text-2xl font-bold text-blue-600">Chi tiết Tin tức</span>}
        extra={
          <Space>
            <Tooltip title="Quay lại">
              <Button
                type="default"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/news/edit/${data._id}`)}
              />
            </Tooltip>
          </Space>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {/* Left: Image */}
          <div className="flex flex-col items-center">
            <Image
              src={data.image}
              alt={data.name}
              className="rounded-lg shadow border"
              width="100%"
              preview={{ mask: <EyeOutlined style={{ fontSize: 24, color: 'white' }} /> }}
            />
          </div>

          {/* Right: Details */}
          <div>
            <Descriptions
              title={<span className="text-xl font-semibold text-blue-600">Thông tin Tin tức</span>}
              bordered
              column={1}
              size="middle"
            >
              <Descriptions.Item label="Tiêu đề">
                <span className="font-semibold text-gray-800">{data.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tác giả">
                <span className="text-gray-800 flex items-center gap-1">
                  {data.author}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng">
                {dayjs(data.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {dayjs(data.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {renderStatus(data.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Lượt xem">
                <span className="text-gray-800 flex items-center gap-1">
                  {data.views} <EyeOutlined /> 
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <div className="text-gray-700 whitespace-pre-line">{data.content}</div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewsDetailAdmin;
