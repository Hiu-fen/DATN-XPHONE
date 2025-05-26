import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

interface ICategory {
  _id: string;
  name: string;
}

const GetList = () => {
  const [searchText, setSearchText] = useState('');
  const nav = useNavigate();
  const location = useLocation();

  // Lấy danh sách sản phẩm
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () =>
      (await axios.get('http://localhost:5000/api/products')).data,
  });

  // Lấy danh sách danh mục từ MongoDB
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () =>
      (await axios.get('http://localhost:5000/api/category')).data,
  });

  // Xử lý reload khi cần
  useEffect(() => {
    if (location.state?.forceReload) {
      refetch();
    }
  }, [location.state?.forceReload]);
  useEffect(() => {
  if (categories) {
    console.log('Danh mục:', categories);
  }
}, [categories]);


  // Xử lý xóa sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(`http://localhost:5000/api/products/${id}`),
    onSuccess: () => {
      message.success('Xóa thành công');
      refetch();
    },
    onError: () => {
      message.error('Xóa thất bại');
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // 👉 Hàm lấy tên danh mục theo _id
const getCategoryName = (id: string): string => {
  const category = categories?.find((cat: ICategory) => cat._id === id);
  return category ? category.name : 'Không rõ';
};


  // Tìm kiếm sản phẩm
  const search = products?.filter((p: IProduct) => {
    const categoryName = getCategoryName(p.danhmuc);
    const text = `${p._id} ${p.name} ${p.mota} ${p.price} ${categoryName}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'Stt',
      key: 'stt',
      render: (_: any, __: IProduct, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Ảnh',
      key: 'image',
      dataIndex: 'image',
      render: (image: string) => (
        <img
          src={image}
          alt="ảnh"
          style={{ width: 100, objectFit: 'cover', borderRadius: 8 }}
        />
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_: any, record: IProduct) => (
        <span>{record.price ? record.price.toLocaleString() : 'Không có giá'}</span>
      ),
    },
    {
      title: 'Số lượng',
      key: 'soluong',
      render: (_: any, record: IProduct) => (
        <span>{record.soluong ? record.soluong.toLocaleString() : 'Không còn sản phẩm'}</span>
      ),
    },
    {
      title: 'Mô tả',
      key: 'mota',
      dataIndex: 'mota',
    },
   {
  title: 'Danh mục',
  render: (_: any, record: IProduct) => getCategoryName(record.danhmuc),
},
    {
      title: 'Trạng thái',
      key: 'trangthai',
      render: (_: any, record: IProduct) => {
        const status = record.trangthai?.toLowerCase();
        const color = status === 'còn hàng' ? 'green' : status === 'hết hàng' ? 'red' : 'gray';
        return <span style={{ color }}>{record.trangthai}</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: IProduct) => (
        <>
          <Button onClick={() => nav(`/admin/phone/${record._id}/edit`)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Thông báo"
            description="Bạn chắc chắn muốn xóa?"
            icon={<DeleteOutlined />}
            onConfirm={() => onDelete(record._id)}
            okText="OK"
            cancelText="NO"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  if (loadingProducts || loadingCategories) return <p>Đang tải dữ liệu...</p>;
  if (errorProducts || errorCategories) return <p>Lỗi khi tải dữ liệu, vui lòng thử lại sau.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
          placeholder="Tìm kiếm sản phẩm..."
          className="mb-4"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={search || []}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          pageSizeOptions: ['5', '10', '20'],
        }}
      />
    </div>
  );
};

export default GetList;
