import { useState } from "react";
import { message } from "antd"; 
import TenThuongHieu from "./BrandTitle";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      message.error("Vui lòng nhập email hợp lệ");
      return;
    }

    // Giả lập đăng ký thành công
    message.success("Đăng ký nhận tin thành công!");
    setEmail("");
  };

  return (
    <div className=" py-8 px-4 text-center w-full">
      <h3 className="text-2xl md:text-3xl font-semibold mb-2">
        Đăng ký nhận tin từ <TenThuongHieu />
      </h3>

      <p className="text-gray-600 mb-6">
        Nhận thông tin sản phẩm mới nhất và các chương trình khuyến mãi.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto flex rounded-full overflow-hidden border border-gray-300 bg-white shadow-sm"
      >
        <input
          type="email"
          minLength={100}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập địa chỉ email"
          className="flex-grow px-5 py-2 text-base focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-all"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default NewsletterForm;
