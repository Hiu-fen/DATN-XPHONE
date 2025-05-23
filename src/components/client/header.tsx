import React from 'react';
import { FaShoppingCart, FaUser, FaBell, FaHeart } from 'react-icons/fa';

const ClientHeader = () => {
  return (
    <header className="bg-white shadow">


      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">

          <div className="flex-1 min-w-[120px]">
            <span className="text-2xl font-bold text-red-600">XPhone</span>
          </div>

          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="border p-2 rounded w-full max-w-lg"
            />
          </div>

          <div className="flex-1 flex justify-end gap-6 items-center text-xl text-gray-600">
            <a href="#" className="hover:text-red-500 flex flex-col items-center">
              <FaHeart /><span className="text-xs">Yêu thích</span>
            </a>
            <a href="#" className="hover:text-red-500 flex flex-col items-center">
              <FaBell /><span className="text-xs">Thông báo</span>
            </a>
            <a href="/cart" className="hover:text-red-500 flex flex-col items-center">
              <FaShoppingCart /><span className="text-xs">Giỏ hàng</span>
            </a>
            <a href="/account" className="hover:text-red-500 flex flex-col items-center">
              <FaUser /><span className="text-xs">Tài khoản</span>
            </a>
          </div>
        </div>
      </div>
      {/* Menu */}
        <nav className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto flex justify-center gap-8 p-2 text-gray-700 font-medium px-4 items-center">
            <a href="/home" className="hover:text-red-600">Trang chủ</a>
            <a href="/about" className="hover:text-red-600">Giới thiệu</a>
            <a href="/categorys" className="hover:text-red-600">Danh mục</a>
            <a href="#" className="hover:text-red-600">iPhone</a>
            <a href="#" className="hover:text-red-600">Macbook</a>
            <a href="#" className="hover:text-red-600">iPad</a>
            <a href="#" className="hover:text-red-600">Apple Watch</a>
            <a href="#" className="hover:text-red-600">Phụ kiện</a>     
            <a href="/contact" className="hover:text-red-600">Liên hệ</a>
        </div>
        </nav>
    </header>
  );
};

export default ClientHeader;