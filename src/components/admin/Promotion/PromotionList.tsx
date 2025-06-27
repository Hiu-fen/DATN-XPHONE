import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  message,
  Popconfirm,
  Switch,
  Table,
  Tooltip,
  Input,
} from "antd";
import { Promotion } from "../../../interface/promotion";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  deletePromotion,
  getAllPromotions,
  updatePromotionStatus,
} from "../../../api/admin/promotionApi";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const GetPromotion = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");

  // Lấy danh sách khuyến mãi
  const { data, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      try {
        const response = await getAllPromotions();
        return response.data;
      } catch (error) {
        message.error("Lỗi khi tải danh sách khuyến mãi");
        throw error;
      }
    },
  });

  // Lọc dữ liệu theo tên/mã khuyến mãi (tối ưu hóa với useMemo)
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item: Promotion) =>
      `${item.name} ${item.code}`.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // Mutation cập nhật trạng thái
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      return await updatePromotionStatus(id, status);
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: () => {
      message.error("Cập nhật trạng thái thất bại");
    },
  });

  // Mutation xóa
  const deleteMutation = useMutation({
    mutationFn: async (_id: string) => {
      await deletePromotion(_id);
    },
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: () => {
      message.error("Xóa thất bại");
    },
  });

  const onDelete = (_id: string) => {
    deleteMutation.mutate(_id);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: Promotion, index: number) => index + 1,
    },
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: Promotion) => (
        <Popconfirm
          title="Bạn có chắc muốn thay đổi trạng thái?"
          onConfirm={() =>
            updateStatusMutation.mutate({
              id: record._id,
              status: !status,
            })
          }
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Switch
            checked={status}
            checkedChildren="Hoạt động"
            unCheckedChildren="Hết hạn"
          />
        </Popconfirm>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Promotion) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Sửa">
            <Button
              type="primary"
              onClick={() => navigate(`/admin/promotion/edit/${record._id}`)}
            >
              <EditOutlined />
            </Button>
          </Tooltip>

          <Tooltip title="Chi tiết">
            <Button
              onClick={() => navigate(`/admin/promotion/detail/${record._id}`)}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>

          <Tooltip title="Xóa">
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
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      {/* Header + Search cùng hàng */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách khuyến mãi</h2>

        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc mã khuyến mãi..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-64" 
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        loading={{
          spinning: isLoading,
          tip: "Đang tải dữ liệu...",
        }}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} khuyến mãi`,
        }}
      />
    </div>
  );
};

export default GetPromotion;
