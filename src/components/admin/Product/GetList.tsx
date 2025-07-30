import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from "antd";
import axios from "axios";
import { IProduct } from "../../../interface/product";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

interface ICategory {
  _id: string;
  name: string;
}

const GetList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [inOrderMap, setInOrderMap] = useState<{ [key: string]: boolean }>({});

  const nav = useNavigate();
  const location = useLocation();

  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/products")).data as IProduct[],
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/category")).data as ICategory[],
  });

  useEffect(() => {
    if (location.state?.forceReload) {
      refetch();
    }
  }, [location.state?.forceReload, refetch]);

  // Mutation xóa mềm
  const mutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(`http://localhost:5000/api/products/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      refetch();
    },
    onError: () => {
      message.error("Xóa thất bại");
    },
  });

  // Kiểm tra sản phẩm có nằm trong đơn hàng không
  const checkInOrder = async (id: string) => {
    if (inOrderMap[id] !== undefined) return;

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/products/${id}/check-in-order`
      );
      setInOrderMap((prev) => ({ ...prev, [id]: data.inOrder }));
    } catch {
      message.error("Không thể kiểm tra đơn hàng.");
    }
  };

  const search = products
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? "").getTime() -
        new Date(a.createdAt ?? "").getTime()
    )
    .filter((p) => {
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
    // {
    //   title: "Đang bán?",
    //   key: "status",
    //   dataIndex: "status",
    //   render: (status: boolean) => (
    //     <span style={{ color: status ? "green" : "gray" }}>
    //       {status ? "Đang bán" : "Ngừng bán"}
    //     </span>
    //   ),
    // },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: IProduct) => (
        <Space>
          <Button
            type="default"
            onClick={() => nav(`/admin/phone/${record._id}`)}
          >
            <EyeOutlined />
          </Button>

          <Button
            type="primary"
            onClick={() => nav(`/admin/phone/${record._id}/edit`)}
          >
            <EditOutlined />
          </Button>

          <Popconfirm
            title={
              inOrderMap[record._id!]
                ? "Sản phẩm đang nằm trong đơn hàng. Bạn có chắc chắn muốn xóa không?"
                : "Bạn có chắc chắn muốn xóa sản phẩm này không?"
            }
            onConfirm={() => record._id && mutation.mutate(record._id!)}
            okText="Xóa"
            cancelText="Hủy"
            onOpenChange={() => checkInOrder(record._id!)}
          >
            <Button danger>
              <DeleteOutlined />
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
      <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={() => nav("/admin/phone/deleted-products")}>
          Sản phẩm xóa gần đây
        </Button>

        <Input.Search
          placeholder="Tìm kiếm sản phẩm..."
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={search || []}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          pageSizeOptions: ["5", "10", "20"],
        }}
      />
    </div>
  );
};

export default GetList;
