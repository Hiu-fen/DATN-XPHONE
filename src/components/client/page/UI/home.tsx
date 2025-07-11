import BannerClient from "../../componentChild/Home/banner"
import HotSaleSection from "../../componentChild/Home/hotSale";
import ProductCategory from "../../componentChild/Home/CategoryProduct";
import SmallBanner from "../../componentChild/Home/SmallBanner";
import ProductInfo from "../../componentChild/Home/ProductInfo";
import NewsletterForm from "../../componentChild/Home/NewsletterForm";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/client/productApiClient";
import { useEffect, useState, useRef } from "react";
import IphoneProducts from "../../componentChild/Home/iPhoneProduct";
import SamSung from "../../componentChild/Home/SamSungProducts";
import Chatbot from "../../componentChild/Home/ChatBot";
import { FaShippingFast, FaSearch, FaFire, FaStar } from "react-icons/fa";
import { MdAutorenew, MdSupportAgent, MdCompare } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";

const Home = () => {
  // Sử dụng useQuery để lấy danh sách sản phẩm
  const { data: allProducts, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
  });

  // Toggle trạng thái xem thêm
  const [showAll, setShowAll] = useState(false);
  const [showAllSamSung, setShowAllSamSung] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Refs cho các phần tử cần animation
  const categoryRef = useRef<HTMLDivElement>(null);
  const smallBannerRef = useRef<HTMLDivElement>(null);
  const hotSaleRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);
  const productInfoRef = useRef<HTMLDivElement>(null);
  const samsungRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  // State để track các phần tử đã hiện
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  // Trending searches data
  const trendingSearches = [
    "iPhone 15 Pro Max",
    "Samsung Galaxy S24",
    "iPad Pro 2024",
    "MacBook Air M3",
    "AirPods Pro"
  ];

  // Price comparison data
  const priceComparison = {
    product: "iPhone 15 Pro Max 256GB",
    prices: [
      { store: "Tiki", price: "25.990.000đ", original: "27.990.000đ" },
      { store: "Shopee", price: "26.500.000đ", original: "27.990.000đ" },
      { store: "XPhone", price: "24.990.000đ", original: "27.990.000đ", best: true },
      { store: "Lazada", price: "26.200.000đ", original: "27.990.000đ" }
    ]
  };

  

  // Tự động refetch sau 1 giây nếu đã load xong
  useEffect(() => {
      if (!isLoading) {
        const timeout = setTimeout(() => {
          refetch()
        }, 1000)
        return () => clearTimeout(timeout)
      }
    }, [isLoading, refetch])

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
      productInfoRef.current,
      samsungRef.current,
      policiesRef.current,
      newsletterRef.current
    ];

    elements.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Lọc các sản phẩm theo danh mục: iPhone
  const iphoneProducts = allProducts?.filter(
    (item) => item.danhmuc === "6841178c7543156eb6b12336"
  ) || [];

  // Lọc các sản phẩm theo danh mục: SamSung
  const SamSungProducts = allProducts?.filter(
    (item) => item.danhmuc === "684117a67543156eb6b1233a"
  ) || [];

  // Xử lý danh sách sản phẩm iPhone để hiển thị (8 hoặc tất cả)
  const displayedIphoneProducts = showAll
    ? iphoneProducts
    : iphoneProducts.slice(0, 8);

  // Xử lý danh sách sản phẩm SamSung để hiển thị (8 hoặc tất cả)
  const displayedSamSungProducts = showAllSamSung
    ? SamSungProducts
    : SamSungProducts.slice(0, 8);

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho iPhone
  const handleLoadMoreIphone = () => {
    setShowAll((prev) => !prev);
  };

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho SamSung
  const handleLoadMoreSamSung = () => {
    setShowAllSamSung((prev) => !prev);
  };

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
        <BannerClient />

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
          <IphoneProducts 
            products={displayedIphoneProducts || []} 
            isLoading={isLoading} 
            showAll={showAll}
            onToggleShowAll={handleLoadMoreIphone}
            totalProducts={iphoneProducts.length}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div 
          ref={productInfoRef}
          data-animation-id="productInfo"
          className={getAnimationClass("productInfo")}
        >
          <ProductInfo />
        </div>

        {/* Ipad */}
        <div 
          ref={samsungRef}
          data-animation-id="samsung"
          className={getAnimationClass("samsung")}
        >
          <SamSung 
            products={displayedSamSungProducts || []} 
            isLoading={isLoading} 
            showAll={showAllSamSung}
            onToggleShowAll={handleLoadMoreSamSung}
            totalProducts={SamSungProducts.length}
          />
        </div>

        
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

        {/* Form đăng ký nhận tin */}
        <div 
          ref={newsletterRef}
          data-animation-id="newsletter"
          className={getAnimationClass("newsletter")}
        >
          <NewsletterForm />
        </div>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </>
  )
}

export default Home