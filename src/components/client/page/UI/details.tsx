import {
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IProduct } from "../../../../interface/product";
import { message } from "antd";
import { useQuery } from "@tanstack/react-query";
import CommentSection from "../../componentChild/Detail/CommentSection";
import RelatedProducts from "../../componentChild/Detail/RelatedProducts";
import PromotionSection from "../../componentChild/Detail/PromotionSection";
import SupportPolicy from "../../componentChild/Detail/SupportPolicy";


const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<{
    color: string;
    ram: string;
  } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const navigate = useNavigate();

  // Lấy chi tiết sản phẩm
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (isMounted) {
          setProduct(res.data);
          setMainImage(res.data.image || "/default-image.jpg");
          setSelectedVariant(null);
        }
      } catch (error) {
        console.error("Không thể tải thông tin sản phẩm:", error);
        message.error("Không thể tải thông tin sản phẩm.");
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle select variant
  const handleSelectVariant = (color: string, ram: string) => {
    setSelectedVariant({ color, ram });
    setQuantity(1); // Reset quantity when changing variant
    console.log("Selected variant:", { color, ram });
  };
  
  // Get selected variant price
  const getSelectedVariantPrice = () => {
    if (!selectedVariant) {
      return product?.price ? `${product.price} VNĐ` : "Liên hệ";
    }
    const variant = product?.variants?.find(
      (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
    );
    return variant?.price
      ? `${variant.price} VNĐ`
      : product?.price || "Liên hệ";
  };

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (selectedVariant) {
      const variant = product?.variants?.find(
        (v) =>
          v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      if (variant && value > variant.soluong) {
        message.warning(
          `Số lượng vượt quá tồn kho của biến thể ${variant.color} - ${variant.ram}!`
        );
        return;
      }
    } else if (product && value > product.soluong) {
      message.warning("Số lượng vượt quá tồn kho!");
      return;
    }
    setQuantity(value);
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) {
      message.error("Không tìm thấy sản phẩm.");
      return;
    }

    if (!product.status) {
      message.error("Sản phẩm này không còn được bán.");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id) {
        message.warning("Bạn cần đăng nhập để mua hàng.");
        navigate("/login");
        return;
      }

      if (!product._id) {
        message.warning("Không tìm thấy sản phẩm.");
        return;
      }

      if (product.soluong <= 0) {
        message.warning("Sản phẩm đã hết hàng.");
        return;
      }

      if (!selectedVariant) {
        message.warning("Vui lòng chọn biến thể.");
        return;
      }

      // Tìm biến thể sản phẩm đã chọn
      const variant = product.variants?.find(
        (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );

      // Kiểm tra nếu variant là undefined (không tìm thấy biến thể)
      if (!variant) {
        message.warning("Biến thể không hợp lệ hoặc không có sẵn.");
        return;
      }

      // Kiểm tra số lượng tồn kho của biến thể
      if (variant.soluong <= 0) {
        message.warning(`Biến thể ${variant.color} - ${variant.ram} đã hết hàng!`);
        return;
      }

      // Kiểm tra số lượng vượt quá tồn kho của biến thể
      if (quantity > variant.soluong) {
        message.warning(`Số lượng vượt quá tồn kho của biến thể ${variant.color} - ${variant.ram}!`);
        return;
      }

      // Kiểm tra tổng số lượng sản phẩm trong giỏ hàng hiện tại
      const cartResponse = await axios.get(`http://localhost:5000/api/carts/${user._id}`);
      const cart = cartResponse.data;
      const cartItem = cart.items.find(
        (item: any) =>
          item.productId === product._id &&
          item.color === selectedVariant.color &&
          item.storage === selectedVariant.ram
      );

      // Tính tổng số lượng nếu sản phẩm đã có trong giỏ hàng
      let totalQuantity = quantity;
      if (cartItem) {
        totalQuantity += cartItem.quantity;
      }

      // Kiểm tra nếu tổng số lượng trong giỏ hàng vượt quá số lượng tồn kho
      if (totalQuantity > variant.soluong) {
        message.warning(
          `Số lượng trong giỏ hàng của biến thể ${variant.color} - ${variant.ram} vượt quá tồn kho!`
        );
        return;
      }

      // Thêm vào giỏ hàng nếu không có lỗi
      const cartItemToAdd = {
        userId: user._id,
        items: [
          {
            productId: product._id,
            quantity: quantity,
            price: product.price,
            color: selectedVariant.color,
            storage: selectedVariant.ram,
            categoryId: Array.isArray(product.danhmuc)
            ? product.danhmuc[0] // nếu là mảng, lấy phần tử đầu tiên
            : product.danhmuc     // nếu là 1 id
          },
        ],
      };

      // Gửi yêu cầu POST đến API giỏ hàng
      const response = await axios.post("http://localhost:5000/api/carts", cartItemToAdd);
          message.success("Đã thêm vào giỏ hàng!");
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            console.error("Lỗi thêm giỏ hàng:", error.message);
            message.error(error.response?.data?.message || "Thêm vào giỏ hàng thất bại.");
          } else {
            console.error("Lỗi không phải AxiosError:", error);
            message.error("Thêm vào giỏ hàng thất bại.");
          }
        }
  };

  // Mua ngay
  const handleBuyNow = () => {
    if (!product || !selectedVariant?.color || !selectedVariant?.ram) {
      message.warning("Vui lòng chọn biến thể");
      return;
    }

    const variant = product.variants?.find(
      (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
    );

    if (!variant || quantity > variant.soluong) {
      return message.warning("Số lượng vượt quá tồn kho");
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) {
      message.warning("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }

    const categoryId = Array.isArray(product.danhmuc)
      ? product.danhmuc[0]
      : product.danhmuc;

    const buyNowItem = {
      _id: "buy-now-temp-id", // Nếu cần _id tạm, có thể bỏ nếu không dùng
      productId: product._id,
      productName: product.name,
      image: product.image,
      price: variant.price || product.price,
      soluong: quantity,
      color: selectedVariant.color,
      storage: selectedVariant.ram,
      categoryId, 
    };

    navigate("/checkout", { state: { buyNowItem } });
  };


  const { data: categoryNames } = useQuery<string[]>({
    queryKey: ["category-names", product?.danhmuc],
    queryFn: async () => {
      if (!product?.danhmuc) return ["Không xác định"];
      const categoryIds = Array.isArray(product.danhmuc)
        ? product.danhmuc
        : [product.danhmuc];
      const names = await Promise.all(
        categoryIds.map(async (id) => {
          try {
            const res = await axios.get(
              `http://localhost:5000/api/category/${id}`
            );
            return res.data.name || "Không xác định";
          } catch (error) {
            return "Không xác định";
          }
        })
      );
      return names;
    },
    enabled: !!product?.danhmuc,
  });

  if (!product)
    return <div className="p-10 text-center text-xl">Đang tải sản phẩm...</div>;

  const uniqueVariants = product.variants || [];

  return (
    <div className="w-full h-full bg-white p-4 md:p-8">
      {/* Thông tin */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4">
          <div className="flex flex-col items-center">
            <img
              src={mainImage || "/default-image.jpg"}
              alt={product.name}
              className="w-full max-w-md h-96 object-cover rounded-lg shadow-md mb-4"
            />
            <div className="w-full max-w-md overflow-x-auto flex gap-2 scrollbar-hide">
              {product.albumImages?.length > 0 ? (
                product.albumImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`variant-${idx}`}
                    onClick={() => setMainImage(img)}

                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${mainImage === img
                      ? "border-blue-600"
                      : "border-gray-300 hover:border-gray-500"
                      }`}

                  />
                ))
              ) : (
                <p className="text-gray-500">Không có ảnh phụ.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {!product.status && (
              <p className="text-red-600 font-semibold mb-3">
                Hàng không còn bán
              </p>
            )}
            <p className="text-gray-600 mb-3">
              Thương hiệu:{" "}
              <span className="font-semibold">
                {categoryNames?.join(", ") || "Không xác định"}
              </span>{" "}
              | Trạng thái: <span className={`font-semibold ${product.soluong > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.soluong > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            </p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-gray-700 ">Số lượng:</span>
              <span>{product.soluong || 0}</span>
            </div>
            <div className="mb-4">
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {getSelectedVariantPrice()}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Màu sắc và dung lượng:
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueVariants.length > 0 ? (
                  uniqueVariants.map((variant, idx) => (
                    <button
                      key={idx}

                      className={`px-4 py-2 border rounded-md font-semibold transition-all duration-200 ${selectedVariant?.color === variant.color &&
                        selectedVariant?.ram === variant.ram
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-500 text-gray-700"
                        }`}

                      onClick={() =>
                        handleSelectVariant(variant.color, variant.ram)
                      }
                    >
                      {`${variant.color} - ${variant.ram}`}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">Không có biến thể nào.</p>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Số lượng:
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="w-16 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:border-blue-600"
                  min={1}
                  max={
                    selectedVariant
                      ? product?.variants?.find(
                          (v) =>
                            v.color === selectedVariant.color &&
                            v.ram === selectedVariant.ram
                        )?.soluong || 1
                      : product.soluong
                  }
                />
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-gray-700">
                Số lượng tồn kho:{" "}
                {selectedVariant
                  ? product?.variants?.find(
                      (v) =>
                        v.color === selectedVariant.color &&
                        v.ram === selectedVariant.ram
                    )?.soluong || 0
                  : product.soluong}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-md w-full">
            <button
              className="flex-1 bg-black text-white py-2 px-6 rounded-lg font-semibold"
              onClick={handleBuyNow} 
              disabled={!product.status}
            >
              MUA NGAY
            </button>
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 border-2 border-red-600 text-red-600 py-2 px-6 rounded-lg font-semibold text-sm md:text-base hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={!product.status}
            >
              <ShoppingCartOutlined className="text-base" />
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
        {/* Hiển thị khuyến mãi và chính sách hỗ trợ */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <PromotionSection />
          <SupportPolicy />
        </div>
      </div>
      {/* Mô tả sản phẩm */}
      <section className="w-full mt-16 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 md:mb-8 border-b border-gray-300 pb-3 text-gray-900">
            MÔ TẢ SẢN PHẨM
          </h2>
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-3xl mx-auto text-gray-700 leading-relaxed">
            <p>{product.mota || "Không có mô tả."}</p>
          </div>
        </div>
      </section>

      {/* Hiển thị bình Luận */}
      <CommentSection />
      {/* Sản phẩm liên quan */}
      <RelatedProducts />
    </div >
  );
};

export default Details;