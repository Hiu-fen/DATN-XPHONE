import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNewsById } from '../../../../api/client/newClient';
import { Card, Skeleton, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: news,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['newsDetail', id],
    queryFn: () => getNewsById(id || ''),
    enabled: !!id,
    select: (res) => res.data,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Skeleton active paragraph={{ rows: 6 }} className="w-full max-w-3xl" />
      </div>
    );
  }

  if (isError || !news) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Title level={3} type="danger">
          Không tìm thấy tin tức
        </Title>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 flex justify-center">
      <div className="w-full relative">
        {/* Nút quay lại */}
        

        {/* Thẻ H2 tiêu đề chính */}
        <div className="mb-6 text-center">
            <h2 className="text-center text-green-700 text-4xl font-bold mb-6">
                Chi tiết tin tức
            </h2>
        </div>

        <Card
          className="border-2 rounded-lg shadow-lg"
          cover={
            <div className="relative">
              <img
                src={news.image}
                alt={news.name}
                className="h-[400px] w-full object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>
          }
        >
          <div className="mb-4">
            <Text type="secondary" className="text-sm">
              Ngày đăng: {new Date(news.createdAt).toLocaleDateString('vi-VN')}
            </Text>
            <br />
            <Text type="secondary" className="text-sm">
              Tác giả: {news.author}
            </Text>
          </div>

          <Title level={3}>{news.name}</Title>

          <Paragraph className="mt-4 text-gray-700 leading-7 whitespace-pre-line">
            {news.content}
          </Paragraph>
        <Button
          type="default"
          shape="round"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10"
        >
          Quay lại
        </Button>
        </Card>
      </div>
    </div>
  );
};

export default NewsDetail;
