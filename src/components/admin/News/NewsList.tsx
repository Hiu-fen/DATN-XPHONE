import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  message,
  Input,
  Popconfirm,
  Switch,
  Tooltip,
  Image,
  Space,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  deleteNews,
  getAllNews,
  updateNewsStatus,
} from '../../../api/admin/newAdmin';
import { INews } from '../../../interface/News';

const NewsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  // 🔥 Fetch all news
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await getAllNews();
      return response.data;
    },
  });

  useEffect(() => {
    if (isError) {
      message.error('Lỗi khi tải danh sách tin tức');
    }
  }, [isError]);

  // ✅ Mutation toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      return await updateNewsStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      message.success('Cập nhật trạng thái thành công!');
    },
    onError: () => {
      message.error('Không thể cập nhật trạng thái!');
    },
  });

  // ✅ Mutation delete news
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteNews(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      message.success('Xóa tin tức thành công!');
    },
    onError: () => {
      message.error('Không thể xóa tin tức!');
    },
  });

  // 🔎 Filter by search text
  const filteredNews = data?.filter((item: INews) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: INews, index: number) => index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) => (
        <Tooltip title="Click để xem ảnh">
          <Image
            src={src}
            alt="news"
            width={200}
            height={120}
            className="rounded-md border border-gray-200 object-cover"
            preview={{ mask: <EyeOutlined className="text-white text-xl" /> }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean, record: INews) => (
        <Popconfirm
          title={`Bạn có chắc chắn muốn ${
            status ? 'ẩn' : 'hiển thị'
          } tin này không?`}
          okText="Có"
          cancelText="Hủy"
          icon={<ExclamationCircleOutlined className="text-yellow-500" />}
          onConfirm={() =>
            toggleStatusMutation.mutate({ id: record._id, status: !status })
          }
        >
          <Switch
            checked={status}
            checkedChildren="Hiển thị"
            unCheckedChildren="Ẩn"
            className="bg-gray-200"
          />
        </Popconfirm>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: INews) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/news/edit/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/news/detail/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Popconfirm
              title="Bạn chắc chắn muốn xoá tin này?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Xoá"
              cancelText="Hủy"
              icon={<ExclamationCircleOutlined />}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-5 font-sans text-base text-gray-700">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold mb-4 text-green-600">Danh sách tin tức</h2>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/news/add')}
            className="flex items-center gap-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition duration-200"
          >
            <PlusOutlined />
            Thêm tin tức
          </button>
          <Input.Search
            placeholder="Tìm kiếm tin tức..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredNews}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} tin tức`,
        }}
        locale={{ emptyText: 'Chưa có tin tức nào' }}
      />
    </div>
  );
};

export default NewsList;
