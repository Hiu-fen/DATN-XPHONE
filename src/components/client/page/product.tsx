import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { ICategory } from '../../../interface/category';
import { Card, Row, Col, Typography, Tag, Spin, Select, Input, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Fetch danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/products')).data
  });

  // Fetch danh sách danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/category')).data
  });

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Lọc theo danh mục
    if (selectedCategory) {
      filtered = filtered.filter((product: IProduct) => product.danhmuc === selectedCategory);
    }

    // Lọc theo tên sản phẩm
    if (searchText) {
      filtered = filtered.filter((product: IProduct) => 
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo giá
    if (priceRange !== 'all') {
      filtered = filtered.filter((product: IProduct) => {
        const price = parseFloat(product.price);
        switch (priceRange) {
          case 'under5':
            return price < 5000000;
          case '5to10':
            return price >= 5000000 && price < 10000000;
          case '10to20':
            return price >= 10000000 && price < 20000000;
          case 'over20':
            return price >= 20000000;
          default:
            return true;
        }
      });
    }

    // Lọc theo trạng thái
    if (status !== 'all') {
      filtered = filtered.filter((product: IProduct) => product.trangthai === status);
    }

    return filtered;
  }, [products, selectedCategory, searchText, priceRange, status]);

  // Reset các bộ lọc khác khi chọn danh mục
  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    setSearchText('');
    setPriceRange('all');
    setStatus('all');
  };

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
                allowClear
                value={selectedCategory || undefined}
                onChange={handleCategoryChange}
              >
                {categories?.map((category: ICategory) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                className="w-full"
                placeholder="Khoảng giá"
                value={priceRange}
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
                value={status}
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
          </Row>
        </Space>
      </div>

      {/* Hiển thị số lượng sản phẩm đã lọc */}
      <div className="mb-4">
        <Text>
          {selectedCategory 
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục ${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}`
            : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </Text>
      </div>

      {/* Danh sách sản phẩm */}
      <Row gutter={[16, 16]}>
        {filteredProducts.map((product: IProduct) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
            <Link to={`/product/${product._id}`}>
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
                  {parseFloat(product.price).toLocaleString('vi-VN')} VNĐ
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
          <Text className="text-gray-500">
            {selectedCategory 
              ? `Không tìm thấy sản phẩm nào trong danh mục ${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}`
              : 'Không tìm thấy sản phẩm phù hợp'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
