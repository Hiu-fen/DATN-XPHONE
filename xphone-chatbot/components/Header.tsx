import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-200">
          <img
            src="/chatbot.png" // 🔁 thay bằng đường dẫn ảnh bạn muốn
            alt="Xphone Logo"
            className="h-8 w-8 object-contain"
          />
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-wide">
          Xphone :3
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-4 text-white text-sm">
        <span className="hover:text-gray-300 transition">Trợ lý AI</span>
        <span className="hover:text-gray-300 transition">Hỗ trợ 24/7</span>
      </div>
    </header>
  );
};

export default Header;
