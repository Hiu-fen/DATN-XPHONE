import { useQuery } from '@tanstack/react-query';
import { IBanner } from '../../../../interface/banner';
import { Skeleton, Carousel } from 'antd';
import { getAllBanners } from '../../../../api/client/bannerApiClient';
import { Link } from 'react-router-dom';
import type { CarouselProps } from 'antd';

const BannerClient = () => {
  // Lấy danh sách banner từ API
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await getAllBanners();
      return response.data.filter((banner: IBanner) => banner.status === true);
    },
    refetchOnWindowFocus: false,
  });

  // Nếu đang loading hoặc không có banner
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

  // Cấu hình Carousel
  const settings: CarouselProps = {
    autoplay: true,
    autoplaySpeed: 8000,
    dots: true,
    effect: 'scrollx', 
  };

  return (
    <div className="relative left-1/2 -translate-x-1/2 overflow-hidden px-4">
      <Carousel {...settings}>
        {banners.map((banner: IBanner) => (
          <div key={banner.id} className="w-full h-[600px]">
            <Link to="#" rel="noopener noreferrer">
              <img
                src={banner.image}
                alt={banner.name}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerClient;
