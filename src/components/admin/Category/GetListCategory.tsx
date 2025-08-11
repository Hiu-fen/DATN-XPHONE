import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, message, Popconfirm, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ICategory } from '../../../interface/category';

const GetListCategory = () => {
  const nav = useNavigate();
  const [searchText, setSearchText] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get(`http://localhost:5000/api/category`)).data,
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:5000/api/category/${id}`),
    onSuccess: () => {
      message.success('Xóa thành công');
      refetch();
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  const search = data?.filter((c: ICategory) => {
    const Text = `${c._id} ${c.name} ${c.mota}`.toLowerCase();
    return Text.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: ICategory, index: number) => index + 1,
    },
    {
      title: 'Tên danh mục',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Ảnh danh mục',
      key: 'image',
      dataIndex: 'image',
      render: (img: string) => (
        <img
          src={img}
          alt="category"
          className="w-[100px] rounded-md object-cover"
        />
      ),
    },
    {
      title: 'Mô tả danh mục',
      key: 'mota',
      dataIndex: 'mota',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ICategory) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => nav(`/admin/category/${record._id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="Thông báo"
            description="Bạn chắc chắn muốn xóa?"
            icon={<DeleteOutlined style={{ color: 'red' }} />}
            onConfirm={() => onDelete(record._id)}
            okText="OK"
            cancelText="NO"
          >
            <Tooltip title="Xoá danh mục">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-5 font-sans text-base text-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-green-600">Danh sách danh mục</h2>

      <div className="flex justify-between items-center gap-2 mb-4">
        <button
          onClick={() => nav('/admin/category/add')}
          className="flex items-center gap-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition duration-200"
        >
          <PlusOutlined />
          Thêm danh mục
        </button>
        <Input.Search
          placeholder="Tìm kiếm theo tên, mô tả..."
          className="w-[300px]"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        rowKey="_id"
        dataSource={search}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default GetListCategory;
