import React, { useState } from "react";
import {
  Button,
  Input,
  message,
  Space,
  Table,
  Tooltip,
  Popconfirm,
  Select,
} from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { IProduct } from "../../../interface/product";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, RollbackOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface ICategory {
  _id: string;
  name: string;
}

const Deleted_products: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filterTime, setFilterTime] = useState("all");
  const nav = useNavigate();

  // Lấy danh sách sản phẩm đã xóa
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
    refetch,
  } = useQuery({
    queryKey: ["deletedProducts"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/products/deleted")).data as IProduct[],
  });

  // Lấy danh mục
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/category")).data as ICategory[],
  });

  // Mutation khôi phục sản phẩm
  const restoreMutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.put(`http://localhost:5000/api/products/${id}`, {
        status: true,
      }),
    onSuccess: () => {
      message.success("Khôi phục thành công");
      refetch();
    },
    onError: () => {
      message.error("Khôi phục thất bại");
    },
  });

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  // Lọc sản phẩm đã xóa và theo thời gian
  const deletedProducts = products
    ?.filter((p) => p.status === false)
    .filter((p) => {
      if (!p.createdAt) return false;

      const created = dayjs(p.createdAt);
      const now = dayjs();

      switch (filterTime) {
        case "today":
          return created.isSame(now, "day");
        case "7days":
          return created.isAfter(now.subtract(7, "day"));
        case "30days":
          return created.isAfter(now.subtract(30, "day"));
        case "all":
        default:
          return true;
      }
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? "").getTime() -
        new Date(a.createdAt ?? "").getTime()
    );

  // Tìm kiếm
  const filtered = deletedProducts?.filter((p) => {
    const text = `${p._id} ${p.name} ${p.mota} ${p.price} ${p.danhmuc}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_: any, __: IProduct, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Ảnh",
      key: "image",
      dataIndex: "image",
      render: (image: string) => (
        <img
          src={image}
          alt="ảnh"
          style={{ width: 100, objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Giá",
      key: "price",
      dataIndex: "price",
      render: (price: number) => (
        <span>{price ? price.toLocaleString() : "Không có giá"}</span>
      ),
    },
    {
      title: "Số lượng",
      key: "soluong",
      dataIndex: "soluong",
      render: (soluong: number) => (
        <span>{soluong ? soluong.toLocaleString() : "Không còn sản phẩm"}</span>
      ),
    },
    {
      title: "Mô tả",
      key: "mota",
      dataIndex: "mota",
      render: (text: string) => (
        <Tooltip title={text}>
          {text.length > 50 ? text.slice(0, 50) + "..." : text}
        </Tooltip>
      ),
    },
    {
      title: "Danh mục",
      key: "danhmuc",
      render: (_: any, record: IProduct) => {
        const found = categories?.find((c) => c._id === record.danhmuc);
        return found ? found.name : record.danhmuc;
      },
    },
    {
      title: "Trạng thái",
      key: "trangthai",
      dataIndex: "trangthai",
      render: (_: any, record: IProduct) => {
        const isAvailable = record.soluong >= 1;
        const statusText = isAvailable ? "Còn hàng" : "Hết hàng";
        const color = isAvailable ? "green" : "red";
        return <span style={{ color }}>{statusText}</span>;
      },
    },
    {
      title: "Đang bán?",
      key: "status",
      dataIndex: "status",
      render: (status: boolean) => (
        <span style={{ color: status ? "green" : "gray" }}>
          {status ? "Đang bán" : "Ngừng bán"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: IProduct) => (
        <Space>
          <Button type="default" onClick={() => nav(`/admin/phone/${record._id}`)}>
            <EyeOutlined />
          </Button>
          <Popconfirm
            title="Khôi phục sản phẩm"
            description="Bạn có chắc muốn khôi phục sản phẩm này?"
            onConfirm={() => handleRestore(record._id!)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="primary" icon={<RollbackOutlined />}>
              Khôi phục
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loadingProducts || loadingCategories) return <p>Đang tải dữ liệu...</p>;
  if (errorProducts || errorCategories) return <p>Lỗi khi tải dữ liệu.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách sản phẩm đã xóa (Ngừng bán)</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Space>
          <Button type="primary" onClick={() => nav("/admin/phone/list")}>
            Quay lại
          </Button>

          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setFilterTime}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Hôm nay", value: "today" },
              { label: "7 ngày trước", value: "7days" },
              { label: "30 ngày trước", value: "30days" },
            ]}
          />
        </Space>

        <Input.Search
          placeholder="Tìm kiếm sản phẩm đã xóa..."
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={filtered || []}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default Deleted_products;
