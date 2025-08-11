// File: ReturnDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  Descriptions,
  Typography,
  Button,
  Space,
  Spin,
  Alert,
  message,
} from "antd";

const { Title } = Typography;

const ReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const returnMutation = useMutation({
    mutationFn: async ({ returnStatus }: { returnStatus: string }) => {
      return await axios.patch(
        `http://localhost:5000/api/orders/${id}/return`,
        {
          returnStatus,
        }
      );
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái yêu cầu trả hàng thành công");
      refetch();
    },
    onError: () => {
      message.error("Có lỗi khi cập nhật yêu cầu trả hàng");
    },
  });

  if (isLoading) return <Spin tip="Đang tải chi tiết yêu cầu..." />;
  if (isError || !order) {
    return <Alert message="Không tìm thấy yêu cầu" type="error" showIcon />;
  }

  return (
    <div>
      <Button
        onClick={() => navigate("/admin/orders")}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      <Title level={3}>Yêu cầu trả hàng: #{order.orderCode}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered size="middle" column={1}>
          <Descriptions.Item label="Tên khách hàng">
            {order.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {order.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái đơn hàng">
            {order.status}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái trả hàng">
            {order.returnStatus || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Lý do trả hàng">
            {order.returnReason || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả bổ sung">
            {order.returnNote || "Không có"}
          </Descriptions.Item>
        </Descriptions>

        {/* Ảnh minh họa */}
        <Title level={4} style={{ marginTop: 24 }}>
          Ảnh minh họa
        </Title>
        {order.returnImages?.length > 0 ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {order.returnImages.map((img: string, idx: number) => (
              <img
                key={idx}
                src={`http://localhost:5000/${img.replace(/\\/g, "/")}`}
                alt={`Ảnh ${idx + 1}`}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Không có ảnh</p>
        )}

        {/* Nút duyệt */}
        {order.returnStatus === "Đang chờ duyệt" && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Tiêu đề và nút cùng bên phải */}
            <Typography.Text strong> Xử lý yêu cầu:</Typography.Text>
            <Space>
              <Button
                type="primary"
                onClick={() =>
                  returnMutation.mutate({ returnStatus: "Đã duyệt" })
                }
              >
                Duyệt
              </Button>
              <Button
                danger
                onClick={() =>
                  returnMutation.mutate({ returnStatus: "Từ chối" })
                }
              >
                Từ chối
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {order.statusHistory?.length > 0 && (
        <Card title="Lịch sử trạng thái">
          <ul style={{ paddingLeft: 20 }}>
            {order.statusHistory.map((entry: any, index: number) => (
              <li key={index}>
                <b>{entry.status}</b> -{" "}
                {new Date(entry.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default ReturnDetail;
