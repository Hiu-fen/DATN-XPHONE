import { useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IComment } from '../../../interface/comments';

interface IProduct {
  _id: string;
  name: string;
}


const CommentAdmin = () => {
  const [searchText, setSearchText] = useState('');

  const { data: comments, refetch } = useQuery({
    queryKey: ['comments'],
    queryFn: async () =>
      (await axios.get(`http://localhost:5000/api/comments`)).data,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () =>
      (await axios.get(`http://localhost:5000/api/products`)).data,
  });

const getProductName = (_id: string) => {
  const product = products?.find((pro: IProduct) => pro._id === _id);
  return product ? product.name : 'Không có sản phẩm';
};


  const toggleStatus = async (_id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`http://localhost:5000/api/comments/${_id}`, {
        status: !currentStatus,
      });
      message.success('Cập nhật trạng thái thành công');
      refetch();
    } catch (error: any) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const toggleLike = async (_id: string, currentLikes: number) => {
    try {
      const updatedLikes = currentLikes + 1;
      await axios.patch(`http://localhost:5000/api/comments/${_id}`, {
        likes: updatedLikes,
      });
      message.success('Đã thích bình luận');
      refetch();
    } catch (error: any) {
      console.error('Lỗi khi cập nhật số tim:', error);
      message.error('Không thể thích bình luận');
    }
  };

  const mutation = useMutation({
    mutationFn: async (_id: string) =>
      await axios.delete(`http://localhost:5000/api/comments/${_id}`),
    onSuccess: () => {
      message.success('Xóa thành công');
      refetch();
    },
    onError: (error: any) => {
      message.error('Xóa bình luận thất bại');
      console.error('Lỗi khi xóa bình luận:', error);
    },
  });

  const onDelete = (_id: string) => {
    mutation.mutate(_id);
  };

const search = comments?.filter((c: IComment) => {
  const productName = getProductName((c.sanpham));
  const Text = ` ${c.user} ${c.content} ${c.date} ${productName}`.toLowerCase();
  return Text.includes(searchText.toLowerCase());
});

  const columns = [
    { title: 'ID',
      dataIndex: 'id' 
    },

    { 
      title: 'Người dùng', 
      dataIndex: 'user' 
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'sanpham',
      render: (_: any, record: IComment) => getProductName(record.sanpham),
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
              onClick={() => toggleLike(record._id, likes)}
              size="small"
              type="link"
            >
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
        <Button onClick={() => toggleStatus(record._id, record.status)}>
          {record.status ? 'Hiện' : 'Ẩn'}
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IComment) => (
        <Popconfirm
          title="Thông báo"
          description="Bạn chắc chắn muốn xóa?"
          icon={<DeleteOutlined />}
          onConfirm={() => {
            console.log('Xóa id:', record._id); 
            onDelete(record._id);
          }}
          okText="OK"
          cancelText="NO"
        >
          <Button danger>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
  ),
}

  ];

  return (
    <div>
     <h2 className="text-2xl font-bold ">Danh sách bình luận</h2>
       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
        placeholder=""
        className="mb-4"
         style={{ width: 300 }} 
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
       </div>
     <Table
            columns={columns}
            dataSource={search}
            rowKey="_id"
            pagination={{
            pageSize: 10, 
            showSizeChanger: false,
            pageSizeOptions: ['10', '20', '30'],
          }}
          />
    </div>
  );
};

export default CommentAdmin;
