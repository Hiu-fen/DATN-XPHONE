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
  FaHashtag
} from 'react-icons/fa';

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

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error('Lỗi khi lấy chi tiết đơn hàng:', err));
  }, [id]);

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

      {/* Tổng tiền */}
      <div className="mt-6 text-right">
        <p className="text-xl text-gray-800 font-bold">
          <FaMoneyBillWave className="inline mr-1 text-green-600" />
          Tổng cộng: <span className="text-green-700">{order.total.toLocaleString()} đ</span>
        </p>
      </div>
    </div>
  );
};

export default OrderDetail;
