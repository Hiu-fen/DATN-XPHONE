import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: 34990000,
            image: 'https://clickbuy.com.vn/uploads/pro/iphone-15-pro-max-1tb-cu-dep-99-sm-197629.png',
            quantity: 1,
            color: 'Titan Xanh',
            storage: '256GB',
        },
        {
            id: 2,
            name: 'Samsung Galaxy S24 Ultra',
            price: 29990000,
            image: 'https://product.hstatic.net/200000409445/product/12_40822dafb8654a558df09c7e5307f69e_master.jpg',
            quantity: 2,
            color: 'Đen Bóng',
            storage: '512GB',
        },
    ]);

    const formatPrice = (price: number) =>
        price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const handleQuantityChange = (id: number, delta: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity + delta),
                    }
                    : item
            )
        );
    };

    const handleRemove = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-10 ">
            <h1 className="text-3xl font-bold mb-8 ">Giỏ Hàng Của Bạn</h1>

            {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">Giỏ hàng của bạn đang trống.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-lg">
                    <table className="w-full bg-white text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="p-4 text-center">STT</th>
                                <th className="p-4 text-left">Sản phẩm</th>
                                <th className="p-4 text-center">Màu sắc</th>
                                <th className="p-4 text-center">Dung lượng</th>
                                <th className="p-4 text-center">Đơn giá</th>
                                <th className="p-4 text-center">Số lượng</th>
                                <th className="p-4 text-center">Thành tiền</th>
                                <th className="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item, index) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50 transition-all">
                                    <td className="text-center p-4 font-semibold">{index + 1}</td>
                                    <td className="p-4 flex items-center gap-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg border object-cover"
                                        />
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                    </td>
                                    <td className="text-center p-4">{item.color}</td>
                                    <td className="text-center p-4">{item.storage}</td>
                                    <td className="text-center p-4 text-red-500 font-medium">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="text-center p-4">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
                                            >
                                                ＋
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-center p-4 font-semibold text-red-600">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                    <td className="text-center p-4">
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-6 px-4 pb-6">
                        <Link
                            to="/home"
                            className="text-blue-600 hover:underline text-sm mb-4 md:mb-0"
                        >
                            ← Quay lại tiếp tục mua sắm
                        </Link>
                        <div className="text-right space-y-2">
                            <p className="text-xl font-bold">
                                Tổng Tiền:{' '}
                                <span className="text-red-600">{formatPrice(total)}</span>
                            </p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                Thanh toán ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
