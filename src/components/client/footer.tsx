import React from 'react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';

const ClientFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 px-4">
        {/* <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 w-full text-sm  justify-between "> */}

        <div>
          <h3 className="font-bold text-lg mb-2">XPhone</h3>
          <p className="text-sm w-5/5 flex justify-between">
            Hệ thống cửa hàng XPhone chuyên bán lẻ điện thoại, máy tính laptop, smartwatch, smartphone, phụ kiện chính hãng - Giá tốt, giao miễn phí.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">Chính sách</h3>
          <ul className="text-sm space-y-1">
            <li>Chính sách mua hàng</li>
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo mật</li>
            <li>Cam kết cửa hàng</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">Hướng dẫn</h3>
          <ul className="text-sm space-y-1">
            <li>Hướng dẫn mua hàng</li>
            <li>Hướng dẫn đổi trả</li>
            <li>Hướng dẫn trả góp</li>
            <li>Hướng dẫn hoàn hàng</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">Mạng xã hội</h3>
          <div className="flex gap-4 mt-2 text-2xl">
            <a href="#" className="hover:text-red-500"><FaInstagram /></a>
            <a href="#" className="hover:text-red-500"><FaTiktok /></a>
            <a href="#" className="hover:text-red-500"><FaFacebookF /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;