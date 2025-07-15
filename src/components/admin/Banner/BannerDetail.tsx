import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBannerById } from '../../../api/admin/banner';
import { IBanner } from '../../../interface/banner';
import { Spin, Tag, Button, Descriptions, Image, Tooltip, Card, Space } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const BannerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<IBanner>({
    queryKey: ['banners', id],
    queryFn: async () => {
      const response = await getBannerById(id!);
      return response.data;
    },
    enabled: !!id
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
        Không thể tải dữ liệu banner.
      </div>
    );
  }

  const renderStatus = (status: boolean) =>
    status ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Ẩn</Tag>;

  const renderPosition = (pos: string) => {
    const colorMap: Record<string, string> = {
      home: 'blue',
      product: 'purple',
      footer: 'volcano',
      sidebar: 'gold',
    };
    return <Tag color={colorMap[pos] || 'default'}>{pos.toUpperCase()}</Tag>;
  };

  return (
    <div className="mt-8 mx-auto border-2 rounded">
      <Card
        title={<span className="text-2xl font-bold text-blue-600">Chi tiết Banner</span>}
        variant="borderless"
        extra={
          <Space>
            <Tooltip title="Quay lại">
              <Button
                type="default"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100"
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/banner/edit/${data._id}`)}
                className="hover:bg-blue-600"
              />
            </Tooltip>
          </Space>
        }
        className="shadow rounded-lg"
      >
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Left: Image */}
          <div className="flex-1 flex justify-center items-center">
            <Image
              src={data.imageUrl}
              alt={data.name}
              className="rounded-lg shadow border"
              preview={{ mask: <EyeOutlined style={{ fontSize: 24, color: 'white' }} /> }}
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1">
            <Descriptions
              title={<span className="text-xl font-semibold text-blue-600">Thông tin Banner</span>}
              column={1}
              bordered
              size="middle"
              className="custom-description"
            >
              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Tên banner</span>}
              >
                <span className="text-gray-800">{data.name}</span>
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Mô tả</span>}
              >
                <span className="text-gray-800">{data.description}</span>
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Đường dẫn tới</span>}
              >
                <a
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {data.link}
                </a>
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Ngày bắt đầu</span>}
              >
                {dayjs(data.startDate).format('DD/MM/YYYY')}
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Ngày kết thúc</span>}
              >
                {dayjs(data.endDate).format('DD/MM/YYYY')}
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Thứ tự hiển thị</span>}
              >
                {data.order}
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Vị trí hiển thị</span>}
              >
                {renderPosition(data.position)}
              </Descriptions.Item>

              <Descriptions.Item
                label={<span className="font-semibold text-gray-700">Trạng thái</span>}
              >
                {renderStatus(data.status)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BannerDetail;
