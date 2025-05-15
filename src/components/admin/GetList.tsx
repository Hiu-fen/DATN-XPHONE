import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, message, Popconfirm, Table } from 'antd'
import axios from 'axios'
import React from 'react'
import { IProduct } from '../../interface/product'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

interface ICategory {
  id: number;
  name: string;
}

const GetList = () => {
  const nav = useNavigate();

  const { data: products, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get(`http://localhost:4000/products`)).data
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get(`http://localhost:4000/category`)).data
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:4000/products/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      refetch();
    }
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // Hàm lấy tên danh mục dựa vào id
  const getCategoryName = (id: number) => {
    const category = categories?.find((cat: ICategory) => cat.id === id);
    return category ? category.name : "Không có danh mục";
  };

  const columns = [
    {
      title: "Stt",
      key: 'stt',
      render: (_: any, __: IProduct, index: number) => index + 1
    },
    {
      title: "Name",
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: "Giá",
      key: 'price',
      render: (_: any, record: IProduct) => (
        <span>{record.price.toLocaleString()} VND</span>
      )
    },
    {
      title: "Mô tả",
      key: 'mota',
      dataIndex: 'mota',
    },
    {
      title: "Danh mục",
      key: 'danhmuc',
      render: (_: any, record: IProduct) => getCategoryName(Number(record.danhmuc))
    },
    {
      title: "Trạng thái",
      key: 'trangthai',
      render: (_: any, record: IProduct) => (
        <span style={{ color: record.trangthai === 'Còn hàng' ? 'green' : 'red' }}>
          {record.trangthai}
        </span>
      )
    },
    
    
    {
      title: "Thao tác",
      key: 'id',
      dataIndex: 'id',
      render: (id: string) => <>
        <Button onClick={() => nav(`/phone/${id}/edit`)}><EditOutlined /></Button>
        <Popconfirm
          title="Thông báo"
          description="Bạn chắc chắn muốn xóa?"
          icon={<DeleteOutlined />}
          onConfirm={() => onDelete(id)}
          okText="OK"
          cancelText="NO"
        >
          <Button danger><DeleteOutlined /></Button>
        </Popconfirm>
      </>
    },
  ];

  return (
    <div>
      <h1>Danh sách sản phẩm</h1><>
        <Table dataSource={products} columns={columns} rowKey="id" />

      
      
      </>
    </div>
  );
}

export default GetList;
