import { Carousel } from "antd";

const messages = [
  "🎉 Miễn phí vận chuyển toàn quốc cho đơn từ 500K!",
  "🔥 Giảm giá đến 50% cho phụ kiện hôm nay!",
  "🎁 Nhận quà tặng khi mua điện thoại bất kỳ!",
  "💳 Trả góp 0% lãi suất qua thẻ tín dụng!",
];

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#1677ff",
  fontWeight: 600,
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
};

const ThongBaoKhuyenMai = () => {
  return (
    <div className="flex-1 max-w-[400px] mx-auto px-2">
      <Carousel
        autoplay
        autoplaySpeed={4000}
        dots={false}
        speed={500}
        vertical
        effect="scrollx"
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <div style={contentStyle}>{msg}</div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ThongBaoKhuyenMai;
