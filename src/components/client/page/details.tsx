import {
    PhoneOutlined,
    StarFilled,
    TruckOutlined,
    GiftOutlined,
    CheckOutlined,
    ShoppingCartOutlined,
    StarOutlined,
} from "@ant-design/icons";

const Details = () => {
    const sampleProduct = {
        name: "iPhone 14 Pro Max 512GB - Chính hãng VN/A",
        code: "IP14PM512-01",
        brand: "Apple",
        condition: "Còn hàng",
        rating: 5,
        reviewCount: 40,
        price: "35,790,000đ",
        discountPrice: "33,900,000đ",
        description:
            "Nổi tiếng iPhone thì chắc chắn iPhone Pro Max luôn là sản phẩm Hot nhất được nhiều khách hàng săn đón. Năm nay 2022 đánh dấu sự ra đời iPhone 14 Pro Max với nhiều thay đổi đáng kể so với iPhone 13 Pro Max. Nổi bật có thể kể đến như thiết kế màn hình tai thỏ được thay thế bằng thiết kế Dynamic Island hoàn toàn mới, camera chính 1 tỷ pixel chụp ảnh siêu sắc nét và những thay đổi về mặt phần cứng khách hàng có thể trải nghiệm ở mức độ siêu phẩm.",
    };

    const relatedProducts = [
        { name: "Tai nghe Apple Earpoods", price: "600,000đ", image: "./src/assets/lq1.webp" },
        { name: "Apple Watch Ultra LTE", price: "19,000,000đ", image: "./src/assets/lq2.webp" },
        { name: "Apple Watch SE LTE", price: "17,500,000đ", image: "./src/assets/lq3.webp" },
        { name: "Cáp sạc Type C Lightning", price: "450,000đ", image: "./src/assets/lq4.webp" },
    ];

    const productImages = [
        "./src/assets/anhchinh.webp",
        "./src/assets/a1.webp",
        "./src/assets/a2.webp",
        "./src/assets/a3.webp",
    ];

    return (
        <div className="bg-white min-h-screen p-6 md:p-12">
            {/* Container chính */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Ảnh sản phẩm */}
                <div className="flex-1">
                    <img
                        src={productImages[0]}
                        alt={sampleProduct.name}
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        {productImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`variant-${idx}`}
                                className={`w-20 h-28 rounded-md cursor-pointer border-4 transition ${idx === 0
                                    ? "border-blue-600"
                                    : "border-transparent hover:border-gray-400"
                                    } object-cover`}
                            />
                        ))}
                    </div>
                </div>
                {/* Thông tin sản phẩm */}
                <div className="flex-[1.3] flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{sampleProduct.name}</h1>
                        <p className="text-gray-600 mb-1">Mã: <span className="font-medium">{sampleProduct.code}</span></p>
                        <p className="text-gray-600 mb-3">
                            Thương hiệu: <span className="font-semibold">{sampleProduct.brand}</span> | Tình trạng: <span className="text-green-600 font-semibold">{sampleProduct.condition}</span>
                        </p>

                        {/* Đánh giá */}
                        <div className="flex items-center text-yellow-400 mb-4">
                            {Array(sampleProduct.rating)
                                .fill(0)
                                .map((_, i) => (
                                    <StarFilled key={i} className="text-xl" />
                                ))}
                            <span className="ml-3 text-gray-500 text-sm">({sampleProduct.reviewCount} đánh giá)</span>
                        </div>

                        {/* Giá */}
                        <div className="mb-6">
                            <p className="text-3xl font-semibold text-red-600">{sampleProduct.discountPrice}</p>
                            <p className="text-gray-400 line-through">{sampleProduct.price}</p>
                        </div>

                        {/* Màu sắc */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Chọn màu sắc:</h3>
                            <div className="flex gap-4">
                                <span className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-blue-600 cursor-pointer shadow-md"></span>
                                <span className="w-8 h-8 rounded-full bg-white border border-gray-300 cursor-pointer shadow-sm"></span>
                                <span className="w-8 h-8 rounded-full bg-purple-700 border border-gray-300 cursor-pointer shadow-sm"></span>
                                <span className="w-8 h-8 rounded-full bg-gray-800 border border-gray-300 cursor-pointer shadow-sm"></span>
                            </div>
                        </div>
                        {/* Chính sách */}
                        <div className="space-y-3 text-gray-700 mb-8">
                            <div className="flex items-center gap-3">
                                <CheckOutlined className="text-green-600 text-xl" />
                                <p>Máy mới Fullbox 100% - Chưa Active - Chính Hãng Apple</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckOutlined className="text-green-600 text-xl" />
                                <p>Hỗ trợ 1 đổi 1 trong 30 ngày nếu lỗi từ nhà sản xuất</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckOutlined className="text-green-600 text-xl" />
                                <p>Bảo hành chính hãng Apple 12 tháng</p>
                            </div>
                        </div>
                        {/* Số lượng */}
                        <div className="flex items-center gap-4 max-w-xs mb-8">
                            <span className="text-lg font-semibold">Số lượng:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button className="px-4 py-2 text-xl font-bold bg-gray-100 hover:bg-red-600 hover:text-white transition">-</button>
                                <span className="px-6 py-2 font-semibold text-lg">2</span>
                                <button className="px-4 py-2 text-xl font-bold bg-gray-100 hover:bg-red-600 hover:text-white transition">+</button>
                            </div>
                        </div>
                    </div>
                    {/* Nút mua hàng */}
                    <div className="flex gap-4">
                        <button className="flex-[3] bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition flex flex-col items-center">
                            MUA NGAY
                            <span className="block text-xs text-gray-300 mt-1">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
                        </button>
                        <button className="flex-[2] flex items-center gap-2 border border-red-600 text-red-600 py-4 rounded-full font-semibold text-lg hover:bg-red-50 transition justify-center">
                            <ShoppingCartOutlined style={{ fontSize: 24 }} />
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
                {/* Chính sách hỗ trợ - bảng dọc có viền ngoài, bo tròn, border-bottom giữa các hàng */}
                <div className="flex-[0.8] bg-white p-4 max-h-[350px]">
                    <div className="bg-black text-white px-4 py-2 flex items-center gap-2 font-semibold text-lg justify-center">
                        <StarOutlined />
                        <span>Chính sách hỗ trợ</span>
                    </div>
                    <table className="w-full border border-gray-300 rounded-lg table-fixed">
                        <tbody>
                            {[
                                {
                                    icon: <TruckOutlined className="text-2xl text-gray-600" />,
                                    title: "Vận chuyển miễn phí",
                                    desc: "Hóa đơn trên 5 triệu",
                                },
                                {
                                    icon: <GiftOutlined className="text-2xl text-gray-600" />,
                                    title: "Quà tặng",
                                    desc: "Hóa đơn trên 10 triệu",
                                },
                                {
                                    icon: <CheckOutlined className="text-2xl text-gray-600" />,
                                    title: "Chất lượng cao",
                                    desc: "Sản phẩm chính hãng",
                                },
                                {
                                    icon: <PhoneOutlined className="text-2xl text-gray-600" />,
                                    title: "Hotline: 0789182477",
                                    desc: "Hỗ trợ 24/7",
                                },
                            ].map((item, idx, arr) => (
                                <tr
                                    key={idx}
                                    className={`${idx !== arr.length - 1 ? "border-b border-gray-300" : ""}`}
                                >
                                    <td className="w-12 text-center py-3">{item.icon}</td>
                                    <td className="py-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{item.title}</span>
                                            <span className="text-xs text-gray-500">{item.desc}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Thông tin chi tiết sản phẩm */}
            <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0">
                <h2 className="text-4xl font-semibold text-center mb-8 border-b-4 border-gray-300 pb-4">
                    THÔNG TIN SẢN PHẨM
                </h2>
                <div className="text-gray-700 text-lg leading-relaxed space-y-6 max-w-3xl mx-auto">
                    <p>{sampleProduct.description}</p>
                    <ul className="list-disc list-inside space-y-3">
                        <li>iPhone 14 Pro Max năm 2022 với tất cả những tính năng mới Dynamic Island...</li>
                        <li>Màn hình Super Retina XDR, Notch tai thỏ bị thay thế bằng Dynamic Island...</li>
                        <li>iPhone 14 Pro và iPhone 14 Pro Max 2022 đánh dấu sự ra đời màn hình Dynamic Island...</li>
                    </ul>
                </div>
            </section>
            {/* Sản phẩm liên quan */}
            <section className="max-w-7xl mx-auto mt-20 px-4 md:px-0">
                {/* Tiêu đề */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-red-600 w-1.5 rounded-lg h-12 animate-pulse" />
                    <h2 className="text-red-600 font-semibold text-2xl md:text-3xl tracking-wide uppercase select-none">
                        SẢN PHẨM LIÊN QUAN
                    </h2>
                </div>

                {/* Lưới sản phẩm */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col items-center bg-white"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-28 h-28 object-cover rounded-lg mb-4 transform transition-transform duration-300 hover:scale-105"
                            />
                            <h3 className="font-semibold text-center mb-2 line-clamp-2 text-gray-900 hover:text-red-600 transition-colors duration-300 text-base md:text-sm">
                                {item.name}
                            </h3>
                            <p className="text-red-600 font-semibold text-lg mb-4">{item.price}</p>
                            <button className="bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition-colors duration-300 w-full text-sm md:text-base">
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Details;
