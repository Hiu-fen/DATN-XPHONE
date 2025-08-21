import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INews } from '../../../../interface/News';
import { Card, Row, Col, Skeleton, Tag, message } from 'antd';
import { getPublishedNews } from '../../../../api/client/newClient';

const { Meta } = Card;

const MAX_TITLE_LENGTH = 60; // độ dài tối đa tiêu đề
const MAX_DESC_LENGTH = 100; // độ dài tối đa mô tả

const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const NewsClient = () => {
  const [news, setNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await getPublishedNews();
      const sortedNews = response.data.sort(
        (a: INews, b: INews) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNews(sortedNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      message.error('Không thể tải tin tức. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-center text-4xl font-bold mb-10">
          Tin tức mới nhất
        </h2>

        <Row gutter={[24, 24]}>
          {news.map((item, index) => (
            <Col
              key={item._id}
              xs={24}
              sm={12}
              md={12}
              lg={6}
            >
              <Card
                hoverable
                className="bg-green-50 rounded-lg shadow-md flex flex-col justify-between h-full"
                cover={
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[200px] w-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {index < 2 && (
                      <Tag
                        color="red"
                        className="absolute top-2 right-2 font-semibold animate-pulse"
                      >
                        HOT
                      </Tag>
                    )}
                  </div>
                }
              >
                <Meta
                  title={
                    <Link
                      to={`/news/${item._id}`}
                      className="block text-lg font-semibold text-gray-800 hover:text-green-700 transition-colors"
                    >
                      {truncateText(item.name, MAX_TITLE_LENGTH)}
                    </Link>
                  }
                  description={
                    <>
                      <p className="text-gray-700 mb-2">
                        {truncateText(item.content, MAX_DESC_LENGTH)}
                      </p>
                      <p className="text-gray-500 text-sm italic">
                        Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </>
                  }
                />
                <div className="flex justify-end mt-3">
                  <Link to={`/news/${item._id}`}>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded"
                    >
                      Đọc thêm
                    </button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default NewsClient;
