import { Link } from 'react-router-dom';

const banners = ["banner1.webp", "banner2.webp", "banner3.webp"];

const SmallBanner = () => (
  <div className="mx-4 md:mx-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
    {banners.map((src, i) => (
      <Link
        key={i}
        to={`/product`}
        className="relative group rounded-2xl overflow-hidden"
      >
        <img
          src={`src/assets/images/${src}`}
          alt={`Banner ${i + 1}`}
          loading="lazy"
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:-translate-y-1 group-hover:brightness-90"
        />

        {/* Overlay mờ nền + hiệu ứng text */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <span className="text-white font-semibold text-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            Xem ngay
          </span>
        </div>
      </Link>
    ))}
  </div>
);

export default SmallBanner;
