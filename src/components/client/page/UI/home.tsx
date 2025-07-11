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

  // Refs cho các phần tử cần animation
  const categoryRef = useRef<HTMLDivElement>(null);
  const smallBannerRef = useRef<HTMLDivElement>(null);
  const hotSaleRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);

  // State để track các phần tử đã hiện
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  // Intersection Observer để track các phần tử
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-animation-id');
            if (elementId) {
              setVisibleElements(prev => new Set([...prev, elementId]));
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger khi 10% phần tử hiện ra
        rootMargin: '0px 0px -50px 0px' // Trigger sớm hơn 50px
      }
    );

    // Observe tất cả các phần tử
    const elements = [
      categoryRef.current,
      smallBannerRef.current,
      hotSaleRef.current,
      iphoneRef.current,
      policiesRef.current,
    ];

    elements.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // CSS classes cho animation
  const getAnimationClass = (elementId: string) => {
    const isVisible = visibleElements.has(elementId);
    return `transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`;
  };

  return (
    <>
      <div className="w-full bg-white">
        {/* Banner - Không cần animation vì đã hiện sẵn */}
        <BannerClient position="banner"/>

        {/* Category Product */}
        <div 
          ref={categoryRef}
          data-animation-id="category"
          className={getAnimationClass("category")}
        >
          <ProductCategory />
        </div>

        {/* Banner phụ */}
        <div 
          ref={smallBannerRef}
          data-animation-id="smallBanner"
          className={getAnimationClass("smallBanner")}
        >
          <SmallBanner />
        </div>

        {/* Hot Sale  */}
        <div 
          ref={hotSaleRef}
          data-animation-id="hotSale"
          className={getAnimationClass("hotSale")}
        >
          <HotSaleSection />
        </div>

        {/* iPhone */}
        <div 
          ref={iphoneRef}
          data-animation-id="iphone"
          className={getAnimationClass("iphone")}
        >
          <IphoneProducts />
        </div>

        <HomeBannerLayout position="layout_home"/>

        {/* 4 chính sách hỗ trợ */}
        <div 
          ref={policiesRef}
          data-animation-id="policies"
          className={`w-full mt-10 mb-6 flex flex-wrap justify-center gap-6 ${getAnimationClass("policies")}`}
        >
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
            <FaShippingFast className="text-red-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Giao hàng nhanh</h3>
            <p className="text-gray-600 text-center text-sm">Nhận hàng trong 2h tại nội thành, 1-3 ngày toàn quốc.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
            <MdAutorenew className="text-blue-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Đổi trả dễ dàng</h3>
            <p className="text-gray-600 text-center text-sm">Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
            <RiShieldCheckFill className="text-green-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Bảo hành chính hãng</h3>
            <p className="text-gray-600 text-center text-sm">Cam kết sản phẩm chính hãng, bảo hành toàn quốc 12-24 tháng.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px] hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
            <MdSupportAgent className="text-yellow-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Hỗ trợ 24/7</h3>
            <p className="text-gray-600 text-center text-sm">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
          </div>
        </div>

        {/* Floating Elements Animation */}
        <div className="fixed bottom-32 right-8 z-40">
          <div className="space-y-4">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <span className="flex items-center">
                🔥 Hot Sale
              </span>
            </div>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
              <span className="flex items-center">
                🎁 Tặng quà
              </span>
            </div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce" style={{animationDelay: '2s'}}>
              <span className="flex items-center">
                🚚 Miễn phí ship
              </span>
            </div>
          </div>
        </div>

        {/* Chatbot */}
        {/* <Chatbot /> */}
      </div>
    </>
  )
}

export default Home