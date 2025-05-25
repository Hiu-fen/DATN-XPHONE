import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { Icatagory } from '../../../interface/category';
import { Card, Row, Col, Typography, Tag, Spin, Select, Input, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Fetch danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:4000/products')).data
  });

  // Fetch danh sách danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:4000/category')).data
  });

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product: IProduct) => {
      // Lọc theo danh mục
      if (selectedCategory !== null && product.danhmuc !== selectedCategory) {
        return false;
      }

      // Lọc theo tên sản phẩm
      if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }

      // Lọc theo giá
      const price = parseFloat(product.price);
      switch (priceRange) {
        case 'under5':
          if (price >= 5000000) return false;
          break;
        case '5to10':
          if (price < 5000000 || price >= 10000000) return false;
          break;
        case '10to20':
          if (price < 10000000 || price >= 20000000) return false;
          break;
        case 'over20':
          if (price < 20000000) return false;
          break;
      }

      // Lọc theo trạng thái
      if (status !== 'all' && product.trangthai !== status) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchText, priceRange, status]);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8">Danh sách sản phẩm</Title>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <Space direction="vertical" size="middle" className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                className="w-full"
                placeholder="Chọn danh mục"
                value={selectedCategory ?? undefined}
                onChange={(value) => setSelectedCategory(value)}
                allowClear
              >
                <Option value={null}>Tất cả danh mục</Option>
                {categories?.map((category: Icatagory) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                className="w-full"
                placeholder="Khoảng giá"
                defaultValue="all"
                onChange={(value) => setPriceRange(value)}
              >
                <Option value="all">Tất cả giá</Option>
                <Option value="under5">Dưới 5 triệu</Option>
                <Option value="5to10">5 - 10 triệu</Option>
                <Option value="10to20">10 - 20 triệu</Option>
                <Option value="over20">Trên 20 triệu</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                className="w-full"
                placeholder="Trạng thái"
                defaultValue="all"
                onChange={(value) => setStatus(value)}
              >
                <Option value="all">Tất cả</Option>
                <Option value="còn hàng">Còn hàng</Option>
                <Option value="hết hàng">Hết hàng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Tìm kiếm sản phẩm"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
          </Row>
        </Space>
      </div>

      {/* Hiển thị số lượng sản phẩm đã lọc */}
      <div className="mb-4">
        <Text>Hiển thị {filteredProducts.length} sản phẩm</Text>
      </div>

      {/* Danh sách sản phẩm */}
      <Row gutter={[16, 16]}>
        {filteredProducts.map((product: IProduct) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Link to={`/product/${product.id}`}>
              <Card
                hoverable
                cover={
                  <img
                    alt={product.name}
                    src={product.image}
                    className="h-48 object-cover"
                  />
                }
              >
                <Title level={4} className="mb-2 line-clamp-2">{product.name}</Title>
                <Text className="block text-lg font-bold text-red-600 mb-2">
                  {product.price} VNĐ
                </Text>
                <Tag color={product.trangthai === 'còn hàng' ? 'green' : 'red'}>
                  {product.trangthai}
                </Tag>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Thông báo khi không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Text className="text-gray-500">Không tìm thấy sản phẩm phù hợp</Text>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
