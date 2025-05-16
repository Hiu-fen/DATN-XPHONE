import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
// import useAutoReloadOnBlank from '../Aside/useAutoReloadOnBlank';
import { useLocation } from 'react-router-dom';
// import { useEffect } from 'react';




interface ICategory {
  id: number;
  name: string;
}

const GetList = () => {

  const nav = useNavigate();
  const location = useLocation();

useEffect(() => {
  if (location.state?.forceReload) {
    refetch();
  }
}, [location.state?.forceReload]);

  

  // Lấy danh sách sản phẩm
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get(`http://localhost:4000/products`)).data,
  });

  // Lấy danh sách danh mục
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get(`http://localhost:4000/category`)).data,
  });

  // Mutation xóa sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: number) =>
      await axios.delete(`http://localhost:4000/products/${id}`),
    onSuccess: () => {
      message.success('Xóa thành công');
      refetch();
    },
    onError: () => {
      message.error('Xóa thất bại');
    },
  });

  const onDelete = (id: number) => {
    mutation.mutate(id);
  };

  // Lấy tên danh mục theo id
  const getCategoryName = (id: number) => {
    if (!categories) return 'Đang tải...';
    const category = categories.find((cat: ICategory) => cat.id === id);
    return category ? category.name : 'Không có danh mục';
  };

  const columns = [
    {
      title: 'Stt',
      key: 'stt',
      render: (_: any, __: IProduct, index: number) => index + 1,
    },
    {
      title: 'Name',
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
        // <span>{record.price.toLocaleString()} VND</span>
        <span>{record.price ? record.price.toLocaleString() : 'Không có giá'}</span>

      ),
    },
    {
      title: 'Mô tả',
      key: 'mota',
      dataIndex: 'mota',
    },
    {
      title: 'Danh mục',
      key: 'danhmuc',
      render: (_: any, record: IProduct) => getCategoryName(Number(record.danhmuc)),
    },
    {
      title: 'Trạng thái',
      key: 'trangthai',
      render: (_: any, record: IProduct) => (
        <span style={{ color: record.trangthai === 'Còn hàng' ? 'green' : 'red' }}>
          {record.trangthai}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id: number) => (
        <>
          <Button onClick={() => nav(`/admin/phone/${id}/edit`)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Thông báo"
            description="Bạn chắc chắn muốn xóa?"
            icon={<DeleteOutlined />}
            onConfirm={() => onDelete(id)}
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

  // Xử lý loading hoặc lỗi
  if (loadingProducts || loadingCategories) return <p>Đang tải dữ liệu...</p>;
  if (errorProducts || errorCategories)
    return <p>Lỗi khi tải dữ liệu, vui lòng thử lại sau.</p>;

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      <Table dataSource={products || []} columns={columns} rowKey="id" />
    </div>
  );
};

export default GetList;
