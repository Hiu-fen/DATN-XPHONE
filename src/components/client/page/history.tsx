import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEye, FaMapMarkerAlt, FaCreditCard, FaBoxOpen, FaShoppingBag } from 'react-icons/fa';

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
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`http://localhost:5000/api/orders/user/${user._id}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Lỗi khi tải lịch sử:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'chờ xử lý':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
      case 'đang xử lý':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
      case 'đang giao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
      case 'đã giao':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'đã hủy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cod':
      case 'tiền mặt':
        return <FaBoxOpen className="w-4 h-4 text-orange-500" />;
      case 'card':
      case 'thẻ':
        return <FaCreditCard className="w-4 h-4 text-blue-500" />;
      default:
        return <FaCreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 min-h-screen">
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 pt-8">
            <div className="flex items-center gap-3 mb-2">
              <FaShoppingBag className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
            </div>
            <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Bắt đầu mua sắm
              </Link>
            </div>
          ) : (
            /* Orders Table */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">#{order.orderCode}</h3>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Số sản phẩm</p>
                          <p className="font-medium text-gray-900">{order.items?.length || 0} sản phẩm</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tổng tiền</p>
                          <p className="font-semibold text-green-600 text-lg">{order.total.toLocaleString()} đ</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getPaymentMethodIcon(order.paymentMethod || '')}
                          <span className="text-sm text-gray-700">{order.paymentMethod || 'Chưa rõ'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 line-clamp-2">{order.address}</span>
                        </div>
                      </div>

                      <Link
                        to={`/history/${order._id}`}
                        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <FaEye className="w-4 h-4" />
                        Xem chi tiết
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số SP
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thanh toán
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">#{order.orderCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.items?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-semibold text-green-600">
                            {order.total.toLocaleString()} đ
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                          {new Date(order.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod || '')}
                            <span className="text-sm text-gray-700">{order.paymentMethod || 'Chưa rõ'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link
                            to={`/history/${order._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <FaEye className="w-4 h-4" />
                            Xem
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {orders.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaShoppingBag className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                    <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng chi tiêu</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()} đ
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaBoxOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Đã hoàn thành</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {orders.filter(order => order.status.toLowerCase().includes('giao') || order.status.toLowerCase().includes('delivered')).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;