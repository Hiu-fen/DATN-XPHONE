import {  useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IComment } from '../../../interface/comments';


interface IProduct {
  id: number;
  name: string
}

const CommentAdmin = () => {
 
  const { data: comments , refetch } = useQuery({
    queryKey:['comments'],
    queryFn: async() =>
      ( await axios.get(`http://localhost:4000/comments`)).data
  })

  const { data: products } = useQuery({
    queryKey:['products'],
    queryFn: async () => (await axios.get(`http://localhost:4000/products`)).data
  })

  const getProductName = (id:number) =>{
    const product = products?.find((pro: IProduct)=> pro.id == id);
    return product ? product.name : "Không có sản phẩm"
  }


  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
       await axios.patch(`http://localhost:4000/comments/${id}`, {
        status: !currentStatus,
      }); 
      message.success("Cập nhật trạng thái thành công");
      refetch();
    } catch (error: any) {

      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

const toggleLike = async (id: number, currentLikes: number) => {
  try {
    const updatedLikes = currentLikes + 1; // Tăng 1 tim khi thích
    await axios.patch(`http://localhost:4000/comments/${id}`, { likes: updatedLikes });
    message.success("Đã thích bình luận");
    refetch(); // Để làm mới lại dữ liệu sau khi cập nhật
  } catch (error: any) {
    console.error("Lỗi khi cập nhật số tim:", error);
    message.error("Không thể thích bình luận");
  }
};

  const mutation = useMutation({
    mutationFn: async (id: any) => await axios.delete(`http://localhost:4000/comments/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      refetch()
    },
    onError: (error: any) => {
      message.error("Xóa bình luận thất bại");
      console.error("Lỗi khi xóa bình luận:", error);
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // Cấu hình bảng hiển thị
  const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Người dùng', dataIndex: 'user' },
  {
    title: 'Sản phẩm',
    dataIndex: 'sanpham',
    render: (_:any, record: IComment) => getProductName(Number(record.sanpham)), 
  },
  { title: 'Nội dung', dataIndex: 'content' },
  {
    title: 'Ngày',
    dataIndex: 'date',
    render: (text: string) => new Date(text).toLocaleString(),
  },
{
  title: 'Đánh giá',
  dataIndex: 'likes',
  render: (likes: number, record: IComment) => {
    return (
      <div>
        <span>{likes} ❤️</span> 
        <Button 
          onClick={() => toggleLike(record.id, likes)} 
          size="small" 
          type="link">
          Thích
        </Button>
      </div>
    );
  },
},
  {
    title: 'Trạng thái',
    key: 'status',
    render: (_: any, record: IComment) => (
      <Button onClick={() => toggleStatus(record.id, record.status)}>
        {record.status ? 'Hiện' : 'Ẩn'}
      </Button>
    ),
  },
  {
    title: 'Thao tác',
    key: 'id',
    dataIndex: 'id',
    render: (id: string) => (
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
    ),
  },
];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách bình luận</h2>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
      />
    </div>
  );
};

export default CommentAdmin;