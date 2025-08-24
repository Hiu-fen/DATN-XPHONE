import IphoneProducts from "../../componentChild/Home/iPhoneProduct";
import BannerClient from "../../componentChild/Home/banner";
import SmallBanner from "../../componentChild/Home/SmallBanner";
import HotSaleSection from "../../componentChild/Home/hotSale";
import ProductCategory from "../../componentChild/Home/CategoryProduct";
import { useEffect, useState, useRef } from "react";
// import Chatbot from "../../componentChild/Home/ChatBot";
import { MdAutorenew, MdSupportAgent } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";
import { FaShippingFast } from "react-icons/fa";
import HomeBannerLayout from "../../componentChild/Home/BannerLayout";

const Home = () => {
  const categoryRef = useRef<HTMLDivElement>(null);
  const smallBannerRef = useRef<HTMLDivElement>(null);
  const hotSaleRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);

  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [progress, setProgress] = useState(100); // Tiến trình từ 100% đến 0%

  // Animation khi cuộn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute("data-animation-id");
            if (elementId) {
              setVisibleElements((prev) => new Set([...prev, elementId]));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = [
      categoryRef.current,
      smallBannerRef.current,
      hotSaleRef.current,
      iphoneRef.current,
      policiesRef.current,
    ];

    elements.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Hiện popup chào mừng và chạy tiến trình
  useEffect(() => {
    setShowWelcome(true);
    setProgress(100);

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000); // Tắt sau 10 giây

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (10000 / 100)); // Giảm 1% mỗi 100ms
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100); // Cập nhật tiến trình mỗi 100ms

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  const closePopup = () => {
    setShowWelcome(false);
  };

  const getAnimationClass = (id: string) =>
    `transition-all duration-1000 ease-out ${visibleElements.has(id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`;
  const [showChat, setShowChat] = useState(false);
  const toggleChat = () => setShowChat((prev) => !prev);

  return (
    <>
      <div className="w-full bg-white">
        {/* ✅ Popup Welcome */}
        {showWelcome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white max-w-xl w-[95%] p-8 rounded-2xl shadow-2xl animate-fade-in-up text-center">
              {/* Nút đóng */}
              <button
                onClick={closePopup}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-3xl font-bold text-blue-600 mb-4">
                🎉 Chào mừng bạn đến với XPHONE!
              </h2>

              <p className="text-gray-700 text-base mb-3 leading-relaxed">
                Cảm ơn bạn đã ghé thăm trang web của chúng tôi!
                <br />
                Tại <strong>XPHONE</strong>, chúng tôi cam kết mang đến:
              </p>

              <ul className="text-gray-700 text-left text-sm sm:text-base list-disc pl-6 mb-4">
                <li>Sản phẩm công nghệ chính hãng từ các thương hiệu lớn.</li>
                <li>Ưu đãi HOT SALE mỗi ngày, quà tặng hấp dẫn.</li>
                <li>Hỗ trợ tư vấn nhanh chóng & thân thiện 24/7.</li>
                <li>Giao hàng nhanh, miễn phí toàn quốc.</li>
              </ul>

              {/* Thanh tiến trình */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 italic mt-2">
                (Thông báo sẽ tự động biến mất sau {Math.ceil(progress / 10)} giây)
              </p>
            </div>
          </div>
        )}

        {/* Banner */}
        <BannerClient position="banner" />

        {/* Category */}
        <div ref={categoryRef} data-animation-id="category" className={getAnimationClass("category")}>
          <ProductCategory />
        </div>

        {/* Small Banner */}
        <div ref={smallBannerRef} data-animation-id="smallBanner" className={getAnimationClass("smallBanner")}>
          <SmallBanner />
        </div>

        {/* Hot Sale */}
        <div ref={hotSaleRef} data-animation-id="hotSale" className={getAnimationClass("hotSale")}>
          <HotSaleSection />
        </div>

        {/* iPhone Product */}
        <div ref={iphoneRef} data-animation-id="iphone" className={getAnimationClass("iphone")}>
          <IphoneProducts />
        </div>

        {/* Banner layout home */}
        <HomeBannerLayout position="layout_home" />

        {/* Chính sách */}
        <div
          ref={policiesRef}
          data-animation-id="policies"
          className={`w-full mt-10 mb-6 flex flex-wrap justify-center gap-6 ${getAnimationClass("policies")}`}
        >
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition duration-300 transform hover:scale-105">
            <FaShippingFast className="text-red-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Giao hàng nhanh</h3>
            <p className="text-gray-600 text-center text-sm">Nhận hàng trong 2h tại nội thành, 1-3 ngày toàn quốc.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition duration-300 transform hover:scale-105">
            <MdAutorenew className="text-blue-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Đổi trả dễ dàng</h3>
            <p className="text-gray-600 text-center text-sm">Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition duration-300 transform hover:scale-105">
            <RiShieldCheckFill className="text-green-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Bảo hành chính hãng</h3>
            <p className="text-gray-600 text-center text-sm">Cam kết sản phẩm chính hãng, bảo hành toàn quốc 12-24 tháng.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition duration-300 transform hover:scale-105">
            <MdSupportAgent className="text-yellow-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Hỗ trợ 24/7</h3>
            <p className="text-gray-600 text-center text-sm">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
          </div>
        </div>

        {/* Floating Icon */}
        <div className="fixed bottom-32 right-8 z-40">
          <div className="space-y-4">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <span className="flex items-center">🔥 Hot Sale</span>
            </div>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce" style={{ animationDelay: "1s" }}>
              <span className="flex items-center">🎁 Tặng quà</span>
            </div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce" style={{ animationDelay: "2s" }}>
              <span className="flex items-center">🚚 Miễn phí ship</span>
            </div>
          </div>
        </div>

        {/* Nút bong bóng */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={toggleChat}
            className="bg-white hover:shadow-xl border border-gray-300 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
            title="Chat với XBot"
          >
            <img
              src="/hi.png"
              alt="Chatbot Icon"
              className="w-8 h-8 object-contain"
            />
          </button>

          {/* Khung chat hiển thị khi showChat = true */}
          {showChat && (
            <div className="mt-2 w-[350px] h-[500px] border rounded-xl shadow-xl overflow-hidden bg-white animate-fade-in-up">
              <iframe
                src="http://localhost:5174"
                title="Chatbot"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;