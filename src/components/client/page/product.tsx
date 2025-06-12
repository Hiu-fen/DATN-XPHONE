import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { ICategory } from '../../../interface/category';

import { Card, Row, Col, Typography, Tag, Spin, Select, Input, Space, Divider, InputNumber, Button, Dropdown } from 'antd';

import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import BannerClient from "../componentChild/Home/banner"

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Danh sách các RAM phổ biến
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];

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
    if (minPrice !== null || maxPrice !== null) {
      filtered = filtered.filter((product: IProduct) => {
        const price = Number(product.price);
        if (minPrice !== null && maxPrice !== null) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice !== null) {
          return price >= minPrice;
        } else if (maxPrice !== null) {
          return price <= maxPrice;
        }
        return true;
      });
    }

    // Lọc theo RAM (so sánh chính xác)
if (selectedRams.length > 0) {
  filtered = filtered.filter((product: IProduct) => {
    if (!product.variants || product.variants.length === 0) return false;

    return product.variants.some(variant =>
      selectedRams.includes(variant.ram.toUpperCase())
    );
  });
}


    // Lọc theo trạng thái còn hàng
    if (showInStockOnly) {
      filtered = filtered.filter((product: IProduct) => {
        // Kiểm tra cả trạng thái và số lượng
        const hasStock = product.trangthai.toLowerCase() === 'còn hàng' || 
                        product.trangthai.toLowerCase() === 'con hang' ||
                        product.soluong > 0;
        return hasStock;
      });
    }

    return filtered;
  }, [products, selectedCategory, searchText, minPrice, maxPrice, selectedRams, showInStockOnly]);

  // Reset các bộ lọc khác khi chọn danh mục
  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    setSearchText('');
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedRams([]);
    setShowInStockOnly(false);
  };

  // Tạo dropdown menu cho bộ lọc
  const filterDropdown = (
    <div className="bg-white p-4 rounded-lg shadow-lg w-[300px]">
      <Space direction="vertical" size="large" className="w-full">
        {/* Khoảng giá */}
        <div className="space-y-2">
          <Text strong className="block text-gray-700">Khoảng giá:</Text>
          <Space className="w-full">
            <InputNumber
              placeholder="Giá từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              className="w-full rounded-lg"
            />
            <InputNumber
              placeholder="Giá đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              className="w-full rounded-lg"
            />
          </Space>
        </div>

        {/* RAM */}
        <div className="space-y-2">
          <Text strong className="block text-gray-700">RAM:</Text>
          <Select
            mode="multiple"
            placeholder="Chọn RAM"
            value={selectedRams}
            onChange={setSelectedRams}
            className="w-full rounded-lg"
            allowClear
          >
            {ramOptions.map(ram => (
              <Option key={ram} value={ram}>{ram}</Option>
            ))}
          </Select>
        </div>

        {/* Tìm kiếm */}
        <div className="space-y-2">
          <Text strong className="block text-gray-700">Tìm kiếm:</Text>
          <Search
            placeholder="Tìm kiếm sản phẩm"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg"
          />
        </div>
      </Space>
    </div>
  );

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
  
    <div className="">
      <BannerClient />
      <Title level={2} className=" text-center mb-8 text-3xl font-bold text-gray-800">Danh sách sản phẩm</Title>

      {/* Bộ lọc */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
        <Space direction="vertical" size="large" className="w-full">
          {/* Danh mục sản phẩm và các nút lọc */}
          <div className="mb-4">
            <Text strong className="block mb-3 text-lg text-gray-700">Danh mục sản phẩm:</Text>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-grow">
                <Space wrap className="gap-2">
                  <Button
                    type={selectedCategory === null ? 'primary' : 'default'}
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === null 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Tất cả
                  </Button>
                  {categories?.map((category: ICategory) => (
                    <Button
                      key={category._id}
                      type={selectedCategory === category._id ? 'primary' : 'default'}
                      onClick={() => handleCategoryChange(category._id)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        selectedCategory === category._id 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </Space>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type={showInStockOnly ? 'primary' : 'default'}
                  onClick={() => setShowInStockOnly(!showInStockOnly)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    showInStockOnly 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Sẵn hàng
                </Button>
                <Dropdown 
                  overlay={filterDropdown} 
                  trigger={['hover']}
                  placement="bottomRight"
                >
                  <Button
                    type="default"
                    icon={<FilterOutlined />}
                    className="px-4 py-2 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Bộ lọc
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
        </Space>
      </div>

      {/* Hiển thị số lượng sản phẩm đã lọc */}
      <div className="mb-6">
        <Text className="text-gray-600">
          {selectedCategory 
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục ${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}`
            : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </Text>
      </div>

      {/* Danh sách sản phẩm */}
      <Row gutter={[24, 24]}>
        {filteredProducts.map((product: IProduct) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
            <Link to={`/detail/${product._id}`}>
              <Card
                hoverable
                className="h-full transition-all duration-300 hover:shadow-xl"
                cover={
                  <div className="relative h-48 overflow-hidden">
                    <img
                      alt={product.name}
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                }
              >
                <Title level={4} className="mb-2 line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors">
                  {product.name}
                </Title>
                <Text className="block text-lg font-bold text-red-600 mb-2">
                  {Number(product.price).toLocaleString('vi-VN')} VNĐ
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Thông báo khi không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Text className="text-gray-500 text-lg">
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
