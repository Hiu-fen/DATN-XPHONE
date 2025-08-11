import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Table, Select, message, Tag, Input, Button, Radio } from "antd";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  productId: string;
  productName: string;
  soluong: number;
  price: number;
  snapshot?: {
    name: string;
    price: number;
    image?: string;
    color?: string;
    storage?: string;
  };
}

interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  isPaid: boolean;
  refunded?: boolean;
  paymentMethod?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  returnStatus?: string;
  returnReason?: string;
  statusHistory?: { status: string; timestamp: string }[];
}

const statusOptions = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang giao",
  "Giao thành công",
  "Đã huỷ",
  "Trả hàng/Hoàn tiền",
];

const fullStatusOptions = [...statusOptions, "Đã nhận hàng"];
const OrderList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingStatusUpdateId, setLoadingStatusUpdateId] = useState<
    string | null
  >(null);

  const getValidStatusOptions = (
    currentStatus: string,
    returnStatus?: string
  ) => {
    if (returnStatus === "Đang chờ duyệt" || returnStatus === "Đã duyệt") {
      return [{ label: currentStatus, value: currentStatus }];
    }
    if (
      ["Giao thành công", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(
        currentStatus
      )
    ) {
      return [{ label: currentStatus, value: currentStatus }];
    }
    if (currentStatus === "Đang giao") {
      return [
        { label: "Đang giao", value: "Đang giao" },
        { label: "Giao thành công", value: "Giao thành công" },
      ];
    }
    if (["Chờ xác nhận", "Đang xử lý"].includes(currentStatus)) {
      const currentIndex = statusOptions.indexOf(currentStatus);
      const nextStatus = statusOptions[currentIndex + 1];
      return [
        { label: currentStatus, value: currentStatus },
        { label: nextStatus, value: nextStatus },
        { label: "Đã huỷ", value: "Đã huỷ" },
      ];
    }
    return [{ label: currentStatus, value: currentStatus }];
  };

  const {
    data: orders,
    refetch,
    isLoading,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/orders");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    },
  });

  const handleStatusChange = (
    id: string,
    currentStatus: string,
    newStatus: string
  ) => {
    if (loadingStatusUpdateId) {
      message.warning("Đang cập nhật trạng thái, vui lòng chờ...");
      return;
    }

    if (!statusOptions.includes(newStatus)) {
      message.error("Trạng thái không hợp lệ");
      return;
    }

    if (newStatus === "Đã nhận hàng") {
      message.warning(
        "Admin không được phép chuyển đơn sang trạng thái 'Đã nhận hàng'."
      );
      return;
    }

    if (
      ["Giao thành công", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(
        currentStatus
      )
    ) {
      message.warning(`Không thể thay đổi từ trạng thái "${currentStatus}"`);
      return;
    }

    const currentIndex = statusOptions.indexOf(currentStatus);
    const newIndex = statusOptions.indexOf(newStatus);

    if (
      newStatus !== "Đã huỷ" &&
      newStatus !== "Trả hàng/Hoàn tiền" &&
      newIndex !== currentIndex + 1
    ) {
      message.warning("Chỉ có thể chuyển sang trạng thái tiếp theo");
      return;
    }

    setLoadingStatusUpdateId(id); // chặn bấm lại

    mutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          // Nếu là đơn COD và chuyển sang Giao thành công → đã thanh toán
          if (newStatus === "Giao thành công") {
            const order = orders?.find((o) => o._id === id);
            if (
              order?.paymentMethod === "COD" &&
              newStatus === "Giao thành công"
            ) {
              message.success("Đơn đã được thanh toán");
            }
          }
        },
        onSettled: () => setLoadingStatusUpdateId(null),
      }
    );
  };

  const filteredOrders = orders
    ?.filter((o) =>
      `${o.orderCode} ${o.customerName} ${o.phone} ${o.total}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (_: any, record: Order) => (
        <a
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => navigate(`/admin/orders/${record._id}`)}
        >
          {record.orderCode}
        </a>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => total.toLocaleString() + " VND",
    },
    {
      title: "Thanh toán",
      key: "isPaid",
      render: (_: any, record: Order) => {
        if (record.refunded) return <Tag color="red">Đã hoàn tiền</Tag>;

        if (record.paymentMethod === "COD") {
          return (
            <Tag color={record.isPaid ? "green" : "orange"}>
              {record.isPaid ? "COD - Đã thanh toán" : "COD - Chưa thanh toán"}
            </Tag>
          );
        }

        if (
          record.paymentMethod === "Momo" ||
          record.paymentMethod === "VNPAY"
        ) {
          return (
            <Tag color={record.isPaid ? "green" : "orange"}>
              {record.isPaid
                ? `${record.paymentMethod} - Đã thanh toán`
                : `${record.paymentMethod} - Chưa thanh toán`}
            </Tag>
          );
        }

        return (
          <Tag color="default">{record.paymentMethod || "Không xác định"}</Tag>
        );
      },
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => method || "Chưa xác định",
    },
    {
      title: "Trạng thái đơn hàng",
      key: "status",
      render: (_: any, record: Order) => (
        <Select
          value={record.status}
          onChange={(value) =>
            handleStatusChange(record._id, record.status, value)
          }
          style={{ width: 160 }}
          loading={loadingStatusUpdateId === record._id}
          options={getValidStatusOptions(record.status, record.returnStatus)}
          placeholder="Chọn trạng thái"
          disabled={
            ["Hoàn thành", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(
              record.status
            ) ||
            ["Đang chờ duyệt", "Đã duyệt"].includes(record.returnStatus || "")
          }
        />
      ),
    },
    {
      title: "Trả Hàng",
      dataIndex: "returnStatus",
      key: "returnStatus",
      render: (status: string, record: Order) => {
        if (status) {
          return (
            <Button
              type="link"
              onClick={() => navigate(`/admin/orders/${record._id}/return`)}
            >
              Yêu Cầu Trả Hàng
            </Button>
          );
        }
        return <span>.</span>;
      },
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 text-green-600">Danh sách đơn hàng</h2>
      <div>
        {/* Bộ lọc theo trạng thái đơn hàng */}
        <div className="flex justify-center   mr-[220px] mb-[-33px]">
          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">Tất cả</Radio.Button>
            {fullStatusOptions.map((status) => (
              <Radio.Button key={status} value={status}>
                {status}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        {/* Tìm kiếm đơn hàng */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Input.Search
            placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
            className="mb-4"
            style={{ width: 300, 
              marginTop:50
            }}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* Bảng danh sách đơn */}
      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrderList;
