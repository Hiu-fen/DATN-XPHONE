import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchClient = () => {
  return (
    <Input
      placeholder="Tìm kiếm sản phẩm..."
      className="w-full"
      size="large"
      prefix={<SearchOutlined />}
      allowClear
    />
  );
};

export default SearchClient;
