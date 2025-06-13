import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBannerById } from '../../../api/admin/banner';
import { IBanner } from '../../../interface/banner';
import { Spin, Tag, Button, Descriptions, Image, Tooltip } from 'antd';
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

  if (isLoading) return <div className="text-center py-20"><Spin size="large" /></div>;
  if (isError || !data) return <div className="text-center text-red-500">Không thể tải dữ liệu banner.</div>;

  return (
    <div className="mt-10 max-w-none p-6 bg-white border-black rounded-xl -mx-5 lg:-mx-0 font-sans text-base text-gray-700 leading-relaxed">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Ảnh bên trái */}
        <div
          className="md:w-2/3 flex justify-center items-center"
          style={{ minHeight: 300 }}
        >
          <Image
            src={data.imageUrl}
            alt={data.name}
            style={{
              borderRadius: 10,
              boxShadow: '0 6px 6px rgba(0,0,0,0.1)',
              border: '1px solid #ddd',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            preview={{ mask: <EyeOutlined style={{ fontSize: 24, color: 'white' }} /> }}
          />
        </div>

        {/* Thông tin bên phải */}
        <div className="md:w-1/3">
          <Descriptions
            title="Thông tin banner"
            bordered
            column={1}
            size="middle"
            styles={{
              label: { fontWeight: '600', width: 150 },
              content: { color: '#4b5563' }
            }}
          >
            <Descriptions.Item label="Tên banner">{data.name}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{data.description}</Descriptions.Item>
            <Descriptions.Item label="Link sự kiện">
              <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                {data.link}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {dayjs(data.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {dayjs(data.endDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự hiển thị">{data.order}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {data.status ? (
                <Tag color="green">Hiển thị</Tag>
              ) : (
                <Tag color="red">Ẩn</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          <div className="pt-4 flex justify-end gap-2">
            <Tooltip title="Quay lại">
              <Button
                type="default"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa" color="blue">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/banner/edit/${data._id}`)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BannerDetail;
