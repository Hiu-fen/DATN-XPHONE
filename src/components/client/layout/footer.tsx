import { FaClock, FaEnvelope, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhone, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ClientFooter = () => {
  return (
    <footer className="bg-blue-900 text-white py-10">
      <div className="max-w-7xl mx-[100px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-4 px-4 text-sm">
        
        {/* Cột 1: Giới thiệu + Logo */}
        <div>
          <h3 className="font-bold text-2xl mb-3">
            <span className="text-green-500">X</span>
            <span className="text-white">Phone</span>
          </h3>
          <p className="leading-relaxed text-white/90">
            Hệ thống cửa hàng XPhone chuyên bán lẻ điện thoại, laptop, smartwatch, phụ kiện chính hãng. Giá tốt, giao miễn phí toàn quốc.
          </p>
        </div>

        {/* Cột 2: Chính sách */}
        <div>
          <h3 className="font-bold text-lg mb-3">Chính sách</h3>
          <ul className="space-y-2">
            <li>Chính sách mua hàng</li>
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo mật</li>
            <li>Cam kết cửa hàng</li>
          </ul>
        </div>

        {/* Cột 3: Hướng dẫn */}
        <div>
          <h3 className="font-bold text-lg mb-3">Hướng dẫn</h3>
          <ul className="space-y-2">
            <li>Hướng dẫn mua hàng</li>
            <li>Hướng dẫn đổi trả</li>
            <li>Hướng dẫn trả góp</li>
            <li>Hướng dẫn hoàn hàng</li>
          </ul>
        </div>

        {/* Cột 4: Mạng xã hội */}
        <div>
          <h3 className="font-bold text-lg mb-3">Mạng xã hội</h3>
          <div className="flex gap-4 mt-2 text-2xl">
            <Link to={''} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 hover:text-pink-500 transition">
              <FaInstagram />
            </Link>
            <Link to={''} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 hover:text-pink-500 transition">
              <FaTiktok />
            </Link>
            <Link to={''} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 hover:text-pink-500 transition">
              <FaFacebookF />
            </Link>
          </div>
        </div>

        {/* Cột 5: Liên hệ */}
        <div>
      <h3 className="font-bold text-lg mb-3">Liên hệ</h3>
      <ul className="space-y-2">
        <li className="flex items-center">
          <FaMapMarkerAlt className="mr-2" /> Trịnh Văn Bô
        </li>
        <li className="flex items-center">
          <FaPhone className="mr-2" /> Hãy alo cho Hiếu
        </li>
        <li className="flex items-center">
          <FaEnvelope className="mr-2" /> trinhthiduong@gmail.com
        </li>
        <li className="flex items-center">
          <FaClock className="mr-2" /> 8h - 22h (T2 - CN)
        </li>
      </ul>
    </div>
      </div>
    </footer>
  );
};

export default ClientFooter;
