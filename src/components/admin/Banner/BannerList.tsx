import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table, Button, message, Input, Popconfirm, Switch, Tooltip, Image, Tag
} from 'antd';
import {
  EyeOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteBanner, getAllBanners, updateBannerStatus } from '../../../api/admin/banner';
import { IBanner } from '../../../interface/banner';

const BannerList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      try {
        const response = await getAllBanners();
        return response.data;
      } catch (error) {
        message.error('Lỗi khi tải danh sách banner');
      }
    }
  });

  useEffect(() => {
    if (isError) {
      message.error('Lỗi khi tải danh sách banner');
    }
  }, [isError]);

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      return await updateBannerStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      message.success('Cập nhật trạng thái thành công!');
    },
    onError: () => {
      message.error('Không thể cập nhật trạng thái!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteBanner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      message.success('Xoá banner thành công!');
    },
    onError: () => {
      message.error('Không thể xoá banner!');
    },
  });

  const filteredData = data?.filter((banner: IBanner) =>
    banner.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: IBanner, index: number) => index + 1,
    },
    {
      title: 'Tên Banner',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string) => (
        <Tooltip title={imageUrl}>
          <Image
            src={imageUrl}
            alt="banner"
            width={400}
            height={120}
            className="object-cover rounded border border-gray-200"
            preview={{ mask: <EyeOutlined className="text-white text-2xl" /> }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Vị trí hiển thị',
      dataIndex: 'position',
      key: 'position',
      render: (position: string) => {
        // Dùng Tag với màu khác nhau
        switch (position) {
          case 'banner':
            return <Tag color="green">Banner</Tag>;
          case 'layout_home':
            return <Tag color="blue">Trang chủ 3 ảnh</Tag>;
          case 'layout_about':
            return <Tag color="purple">Trang giới thiệu</Tag>;
          default:
            return <Tag color="default">Không xác định</Tag>;
        }
      },
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean, record: IBanner) => (
        <Switch
          checked={status}
          onChange={(checked) =>
            toggleStatusMutation.mutate({ id: record._id, status: checked })
          }
          checkedChildren="Hiển thị"
          unCheckedChildren="Ẩn"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: IBanner) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Chỉnh sửa">
            <Button type="primary" onClick={() => navigate(`/admin/banner/edit/${record._id}`)}>
              <EditOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="Chi tiết">
            <Button onClick={() => navigate(`/admin/banner/detail/${record._id}`)}>
              <EyeOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="Xoá">
            <Popconfirm
              title="Bạn chắc chắn muốn xóa chứ?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button danger loading={deleteMutation.isPending} disabled={deleteMutation.isPending}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 font-sans text-base text-gray-700">
      <h2 className="text-3xl font-bold mb-4 text-green-600">Danh sách Banner</h2>

      <div className="flex justify-between items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/admin/banner/add')}
          className="flex items-center gap-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition duration-200"
        >
          <PlusOutlined />
          Thêm Banner
        </button>
        <Input.Search
          placeholder="Tìm theo tên..."
          allowClear
          className="w-80"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} banner`,
        }}
        locale={{ emptyText: 'Chưa có banner nào' }}
      />
    </div>
  );
};

export default BannerList;
