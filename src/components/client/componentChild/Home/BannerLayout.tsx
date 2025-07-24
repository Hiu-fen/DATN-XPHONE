import { useQuery } from '@tanstack/react-query';
import { IBanner } from '../../../../interface/banner';
import { getActiveBanners } from '../../../../api/client/bannerApiClient';
import { Skeleton, Button } from 'antd';
import { Link } from 'react-router-dom';

interface HomeBannerLayoutProps {
  position?: string; // Có thể truyền position (mặc định: layout_home)
}

const HomeBannerLayout = ({ position = 'layout_home' }: HomeBannerLayoutProps) => {
  // 🚀 Fetch banners từ API
  const { data: banners, isLoading } = useQuery({
    queryKey: ['active-banners', position],
    queryFn: async () => {
      const response = await getActiveBanners(position);
      return response.data as IBanner[];
    },
    refetchOnWindowFocus: false,
  });

  // 🕒 Loading state
  if (isLoading || !banners) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton.Image
              key={index}
              active
              style={{ height: 180 }}
              className="w-full"
            />
          ))}
      </div>
    );
  }

  const bannerCount = banners.length;

  // 👉 Nút xem thêm tuỳ chỉnh
  const RenderViewMoreButton = ({ link }: { link: string }) => (
    <Link to={link}>
      <Button
        type="primary"
        size="small"
        style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)', // gradient màu cam hồng
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          color: '#fff',
          fontWeight: 600,
        }}
        className="hover:scale-105 transition-transform duration-300"
      >
        Xem thêm
      </Button>
    </Link>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 mx-4 md:mx-24">
      {/* 👉 1 banner */}
      {bannerCount === 1 && (
        <div className="col-span-3 relative overflow-hidden  shadow group">
          <Link to={banners[0].link} className="block relative">
            <img
              src={banners[0].imageUrl}
              alt={banners[0].name}
              className="object-cover w-full h-[300px] md:h-[400px] transition duration-300"
            />
            <div className="absolute bottom-3 left-3">
              <RenderViewMoreButton link={banners[0].link} />
            </div>
          </Link>
        </div>
      )}

      {/* 👉 2 banner */}
      {bannerCount === 2 && (
        <>
          {banners.map((banner, index) => (
            <div key={index} className="relative overflow-hidden  shadow group">
              <Link to={banner.link} className="block relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.name}
                  className="object-cover w-full h-[200px] md:h-[300px] transition duration-300"
                />
                <div className="absolute bottom-3 left-3">
                  <RenderViewMoreButton link={banner.link} />
                </div>
              </Link>
            </div>
          ))}
        </>
      )}

      {/* 👉 3 banner */}
      {bannerCount >= 3 && (
        <>
          {/* Left: 1 ảnh lớn */}
          <div className="md:col-span-1 relative overflow-hidden  shadow group">
            <Link to={banners[0].link} className="block relative">
              <img
                src={banners[0].imageUrl}
                alt={banners[0].name}
                className="object-cover w-full h-[400px] md:h-[450px] transition duration-300"
              />
              <div className="absolute bottom-3 left-3">
                <RenderViewMoreButton link={banners[0].link} />
              </div>
            </Link>
          </div>

          {/* Right: 2 ảnh nhỏ xếp dọc */}
          <div className="flex flex-col gap-4 md:col-span-2">
            {banners.slice(1, 3).map((banner, index) => (
              <div key={index} className="relative overflow-hidden  shadow group">
                <Link to={banner.link} className="block relative">
                  <img
                    src={banner.imageUrl}
                    alt={banner.name}
                    className="object-cover w-full h-[180px] md:h-[220px] transition duration-300"
                  />
                  <div className="absolute bottom-3 left-3">
                    <RenderViewMoreButton link={banner.link} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBannerLayout;
