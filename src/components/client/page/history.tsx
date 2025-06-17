import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEye, FaMapMarkerAlt, FaCreditCard, FaBoxOpen } from 'react-icons/fa';

interface Order {
  _id: string;
  orderCode: string;
  total: number;
  status: string;
  date: string;
  items: any[];
  paymentMethod?: string;
  address: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`http://localhost:5000/api/orders/user/${user._id}`)
        .then((res) => setOrders(res.data))
        .catch((err) => console.error('Lỗi khi tải lịch sử:', err));
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">🧾 Lịch sử đơn hàng</h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã đơn</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Số SP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Thanh toán</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Địa chỉ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-gray-100 bg-white">
  {orders.map((order) => (
    <tr key={order._id} className="hover:bg-gray-50 transition">
      <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{order.orderCode}</td>
      <td className="px-4 py-4 text-gray-700 text-center">{order.items?.length || 0}</td>
      <td className="px-4 py-4 text-green-600 font-semibold text-right">{order.total.toLocaleString()} đ</td>
      <td className="px-4 py-4 text-blue-600 text-center">{order.status}</td>
      <td className="px-4 py-4 text-gray-700 text-center">{new Date(order.date).toLocaleDateString()}</td>
      
      <td className="px-4 py-4 text-gray-700 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <FaCreditCard className="text-gray-500" />
          {order.paymentMethod || 'Chưa rõ'}
        </div>
      </td>
      
      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-500" />
          <span>{order.address}</span>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <Link
          to={`/history/${order._id}`}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <FaEye /> Xem
        </Link>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
