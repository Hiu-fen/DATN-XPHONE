import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { IComment } from '../../interface/comments';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { QueryClient, useMutation } from '@tanstack/react-query';


const CommentAdmin = () => {
  const [comments, setComments] = useState<IComment[]>([]);

  // Lấy danh sách bình luận từ API (db.json)
  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get('http://localhost:4000/comments');
      setComments(response.data);
    };
    fetchComments();
  }, []);

  // Hàm để thay đổi trạng thái bình luận (Ẩn/Hiện)
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await axios.patch(`http://localhost:4000/comments/${id}`, { status: newStatus });
    setComments(comments.map(comment =>
      comment.id === id ? { ...comment, status: newStatus } : comment
    ));
  };
  const mutation = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:4000/comments/${id}`),
    onSuccess: (_data, variables) => {
      setComments(prev => prev.filter(c => c.id !== Number(variables)));
    }
}); 
  
  const onDelete = (id: string) => {
    
    mutation.mutate(id);
  };
  

  // Định nghĩa các cột trong bảng
  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Người dùng', dataIndex: 'user' },       // đúng tên đã dùng khi submit
    { title: 'Nội dung', dataIndex: 'content' },      // đúng tên đã dùng
    { title: 'Ngày', dataIndex: 'date' }, 
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
        title: "Thao tác",
        key: 'id',
        dataIndex: 'id',
        render: (id: string) => <>
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
function nav(arg0: string): void {
    throw new Error('Function not implemented.');
}

// function onDelete(id: string): void {
//     throw new Error('Function not implemented.');
// }

