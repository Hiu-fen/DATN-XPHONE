import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaBox,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaClipboardList,
  FaHashtag,
  FaTrashAlt
} from 'react-icons/fa';
import { Modal, Input, Select, message, Radio } from 'antd';

interface Item {
  productName: string;
  soluong: number;
  price: number;
  snapshot: {
    image?: string;
    color?: string;
    storage?: string;
  };
}

interface Order {
  orderCode: string;
  total: number;
  status: string;
  date: string;
  items: Item[];
  paymentMethod?: string;
  address: string;
}

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState(""); // Lý do hủy
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal mở khi hủy
  const [isCancelDisabled, setIsCancelDisabled] = useState(false); // Để khóa nút hủy

  const cancelReasons = [
    "Sản phẩm không còn nhu cầu",
    "Lỗi thông tin sản phẩm",
    "Nhận được sản phẩm bị lỗi",
    "Đặt nhầm sản phẩm",
    "Khác"
  ];

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        // Kiểm tra trạng thái đơn hàng, chỉ cho phép hủy khi "Chờ xác nhận"
        if (res.data.status !== "Chờ xác nhận") {
          setIsCancelDisabled(true); // Khóa nút hủy nếu không phải "Chờ xác nhận"
        }
      })
      .catch(err => console.error('Lỗi khi lấy chi tiết đơn hàng:', err));
  }, [id]);

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      message.warning("Vui lòng chọn lý do huỷ đơn hàng");
      return;
    }

    try {
      // Gọi đúng route PATCH
      await axios.patch(`http://localhost:5000/api/orders/${id}`, {
        status: "Đã huỷ", // Cập nhật trạng thái đơn hàng thành "Đã huỷ"
        returnReason: cancelReason // Lý do hủy đơn hàng
      });

      message.success("Đơn hàng đã được huỷ thành công");
      // Cập nhật lại trạng thái đơn hàng trong state
      setOrder(prevOrder => prevOrder ? { ...prevOrder, status: "Đã huỷ" } : prevOrder);
      setIsModalOpen(false);
      setIsCancelDisabled(true); // Khóa nút hủy sau khi hủy đơn
    } catch (err) {
      console.error("Lỗi khi hủy đơn:", err);
      message.error("Không thể huỷ đơn hàng. Vui lòng thử lại");
    }
  };

  if (!order) {
    return (
      <div className="text-center text-gray-500 py-10 text-lg">
        Đang tải dữ liệu đơn hàng...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Đơn hàng #{order.orderCode}
        </h2>
        <Link
          to="/history"
          className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
        >
          <FaArrowLeft /> Quay lại
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
        <div>
          <p className="text-gray-600 mb-1"> Mã đơn:</p>
          <p className="font-medium text-gray-800">{order.orderCode}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1"> Ngày đặt:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1"> Trạng thái:</p>
          <p className="font-medium text-blue-600">{order.status}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1"> Thanh toán:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            {order.paymentMethod || 'Chưa rõ'}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1"> Địa chỉ:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            {order.address}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1"> Số sản phẩm:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            {order.items.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b bg-gray-50 font-semibold text-gray-700 text-lg flex items-center gap-2">
          Chi tiết sản phẩm
        </div>
        <div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-6 py-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                {item.snapshot?.image && (
                  <img
                    src={item.snapshot.image}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Màu: {item.snapshot?.color || '-'} | Bộ nhớ: {item.snapshot?.storage || '-'}
                  </p>
                  <p className="text-sm text-gray-500">Số lượng: {item.soluong}</p>
                </div>
              </div>
              <div className="text-right text-green-600 font-semibold min-w-[100px]">
                {(item.price * item.soluong).toLocaleString()} đ
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200 ${isCancelDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isCancelDisabled} // Khóa nút hủy khi đơn đã bị hủy
        >
          <FaTrashAlt /> Hủy đơn hàng
        </button>

        <div className="text-xl text-gray-800 font-bold">
          <FaMoneyBillWave className="inline mr-1 text-green-600" />
          Tổng cộng: <span className="text-green-700">{order.total.toLocaleString()} đ</span>
        </div>
      </div>

      {/* Modal hủy đơn */}
      <Modal
        title="Lý do hủy đơn hàng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCancelOrder}
        okText="Xác nhận hủy"
        cancelText="Hủy"
      >
        <div>
          <label className="font-medium text-gray-600">Lý do hủy:</label>
          <Select
            value={cancelReason}
            onChange={(value) => setCancelReason(value)}
            placeholder="Chọn lý do hủy"
            style={{ width: '100%' }}
          >
            {cancelReasons.map((reason, idx) => (
              <Select.Option key={idx} value={reason}>
                {reason}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
