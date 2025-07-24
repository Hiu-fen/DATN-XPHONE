import { useQuery } from '@tanstack/react-query';
import { IBanner } from '../../../../interface/banner';
import { Skeleton, Carousel } from 'antd';
import { Link } from 'react-router-dom';
import type { CarouselProps } from 'antd';
import { getActiveBanners } from '../../../../api/client/bannerApiClient';

interface BannerClientProps {
  position?: string; // ✅ Truyền vị trí banner cần hiển thị (home, product, footer...)
}

const BannerClient = ({ position }: BannerClientProps) => {
  // ✅ Fetch banner từ API, lọc theo position nếu có
  const { data: banners, isLoading } = useQuery({
    queryKey: ['active-banners', position], // ✅ Cache riêng cho từng vị trí
    queryFn: async () => {
      const response = await getActiveBanners(position); // Gọi API lấy banners đang hoạt động
      return response.data as IBanner[]; // Ép kiểu dữ liệu trả về
    },
    refetchOnWindowFocus: false, // ✅ Không tự refetch khi chuyển tab
  });

  // ✅ Hiển thị skeleton loading khi đang fetch hoặc chưa có data
  if (isLoading || !banners || banners.length === 0) {
    return (
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <Skeleton.Image
          active
          style={{ width: '100vw', height: 600, objectFit: 'cover' }}
        />
      </div>
    );
  }

  // ✅ Cấu hình Carousel
  const settings: CarouselProps = {
    autoplay: true,          // Tự động chuyển slide
    autoplaySpeed: 8000,     // Thời gian chuyển slide (ms)
    dots: true,              // Hiển thị dấu chấm điều hướng
    effect: 'scrollx',       // Hiệu ứng trượt ngang
    arrows: true,            // Hiển thị mũi tên điều hướng
  };

  return (
    <div className="relative left-1/2 -translate-x-1/2 overflow-hidden px-4">
      <Carousel {...settings}>
        {banners.map((banner: IBanner) => (
          <div key={banner._id} className="w-full h-[550px]">
            <Link to={banner.link} rel="noopener noreferrer">
              <img
                src={banner.imageUrl}
                alt={banner.name}
                className="w-full h-full object-cover shadow-md"
              />
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerClient;
