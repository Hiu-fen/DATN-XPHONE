import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, message, Popconfirm, Switch, Table } from "antd";
import { Promotion } from "../../../interface/promotion";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { deletePromotion, getAllPromotions, updatePromotionStatus } from "../../../api/admin/promotionApi";

const GetPromotion = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy danh sách khuyến mãi
  const { data, isLoading } = useQuery({
  queryKey: ['promotions'],
  queryFn: async () => {
      try {
        const response = await getAllPromotions();
        return response.data;
      } catch (error) {
        message.error("Lỗi khi tải danh sách khuyến mãi");
        throw error; 
      }
    }
  })

  // Mutation cập nhật trạng thái khuyến mãi
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      return await updatePromotionStatus(id, status);
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: () => {
      message.error("Cập nhật trạng thái thất bại");
    },
  });

  // Mutation xóa khuyến mãi
  const mutation = useMutation({
    mutationFn: async (_id: string) => {
      await deletePromotion(_id);
    },
    onSuccess: () => {
      message.success('Xóa thành công');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: () => {
      message.error('Xóa thất bại');
    }
  });

  // Hàm gọi xóa
  const onDelete = (_id: string) => {
    mutation.mutate(_id);
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: Promotion, index: number) => index + 1,
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
        render: (status: boolean, record: Promotion) => (
        <Switch
          checked={status}
          onChange={(checked) => {
            updateStatusMutation.mutate({ id: record._id, status: checked });
          }}
          checkedChildren="Hoạt động"
          unCheckedChildren="Hết hạn"
          className="mb-4 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Promotion) => (
        <div className="flex justify-center items-center gap-2">
          <Button type="primary" onClick={() => navigate(`/admin/promotion/edit/${record._id}`)}>
            <EditOutlined />
          </Button>
          <Button onClick={() => navigate(`/admin/promotion/detail/${record._id}`)}>
            <EyeOutlined />
          </Button>
          <Popconfirm
            title="Thông báo"
            description="Bạn chắc chắn muốn xóa?"
            onConfirm={() => onDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Danh sách khuyến mãi</h2>

      {/* Bảng hiển thị dữ liệu */}
      <Table
        dataSource={data}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} khuyến mãi`,
        }}
        //  pagination={false}
      />
    </div>
  )
}

export default GetPromotion;
