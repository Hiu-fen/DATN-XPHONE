import { ShoppingCartOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IProduct } from "../../../../interface/product";
import { message, Modal } from "antd";
import { useQuery } from "@tanstack/react-query";
import CommentSection from "../../componentChild/Detail/CommentSection";
import RelatedProducts from "../../componentChild/Detail/RelatedProducts";
import PromotionSection from "../../componentChild/Detail/PromotionSection";
import SupportPolicy from "../../componentChild/Detail/SupportPolicy";
import socket from "../../../../socket";

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<{
    color: string;
    ram: string;
  } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"buyNow" | "addToCart" | null>(null);
  const [modalVariant, setModalVariant] = useState<{ color: string; ram: string } | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalImage, setModalImage] = useState<string>("");
  
  // 🔥 STATE CHO MODAL LIÊN HỆ
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalAction, setContactModalAction] = useState<"buyNow" | "addToCart" | null>(null);
  
  const navigate = useNavigate();

  // 🔥 FUNCTION KIỂM TRA TỔNG GIÁ TRỊ ĐƠN HÀNG CÓ TRÊN 100 TRIỆU KHÔNG
  const isHighValueOrder = (unitPrice: number, quantity: number): boolean => {
    const totalValue = Number(unitPrice) * Number(quantity);
    const threshold = 100000000; // 100 triệu
    const isHigh = totalValue > threshold;
    
    if (isHigh) {
      console.log("💎 High value order detected:", {
        unitPrice: unitPrice.toLocaleString(),
        quantity,
        totalValue: totalValue.toLocaleString(),
        threshold: threshold.toLocaleString()
      });
    }
    
    return isHigh;
  };

  // 🔥 FUNCTION LẤY GIÁ HIỆN TẠI CỦA SẢN PHẨM/VARIANT
  const getCurrentPrice = (): number => {
    let price = 0;
    
    if (selectedVariant && product?.variants) {
      const variant = product.variants.find(
        (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      price = variant?.price || product?.price || 0;
    } else {
      price = product?.price || 0;
    }
    
    return Number(price);
  };

  // 🔥 FUNCTION LẤY GIÁ CỦA MODAL VARIANT
  const getModalCurrentPrice = (): number => {
    let price = 0;
    
    if (modalVariant && product?.variants) {
      const variant = product.variants.find(
        (v) => v.color === modalVariant.color && v.ram === modalVariant.ram
      );
      price = variant?.price || product?.price || 0;
    } else {
      price = product?.price || 0;
    }
    
    return Number(price);
  };

  // 🔥 FUNCTION TÍNH TỔNG GIÁ TRỊ HIỆN TẠI
  const getCurrentTotalValue = (): number => {
    const unitPrice = getCurrentPrice();
    return unitPrice * quantity;
  };

  // 🔥 FUNCTION TÍNH TỔNG GIÁ TRỊ MODAL
  const getModalTotalValue = (): number => {
    const unitPrice = getModalCurrentPrice();
    return unitPrice * modalQuantity;
  };

  // Fetch product details
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (isMounted) {
          setProduct(res.data);
          setMainImage(res.data.image || "/default-image.jpg");
          setModalImage(res.data.image || "/default-image.jpg");
          setSelectedVariant(null);
        }
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        message.error("Không thể tải thông tin sản phẩm.");
        navigate("/products");
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Socket.IO for real-time updates
  useEffect(() => {
    socket.on("productUpdated", (updatedProduct: IProduct) => {
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);
        setMainImage(updatedProduct.image || "/default-image.jpg");
        setModalImage(updatedProduct.image || "/default-image.jpg");
        if (
          selectedVariant &&
          !updatedProduct.variants?.some(
            (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
          )
        ) {
          setSelectedVariant(null);
          setModalVariant(null);
          setQuantity(1);
          setModalQuantity(1);
          message.warning("Biến thể đã chọn không còn tồn tại, vui lòng chọn lại.");
        }
        if (!updatedProduct.status) {
          message.warning("Sản phẩm này không còn được bán.");
        }
      }
    });

    socket.on("productDeleted", (deletedProductId: string) => {
      if (deletedProductId === id) {
        setProduct((prevProduct) =>
          prevProduct ? { ...prevProduct, status: false } : null
        );
        message.warning("Sản phẩm này không còn được bán.");
      }
    });

    return () => {
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, [id, selectedVariant]);

  // Handle variant selection and image switching
  const handleSelectVariant = (color: string, ram: string, index: number) => {
    setSelectedVariant({ color, ram });
    setModalVariant({ color, ram });
    setModalQuantity(1);
    
    const albumLength = product?.albumImages?.length || 0;
    const newImage = albumLength > 0
      ? product?.albumImages[index % albumLength] || product?.image || "/default-image.jpg"
      : product?.image || "/default-image.jpg";
    setMainImage(newImage);
    setModalImage(newImage);
  };

  // Handle modal variant selection
  const handleModalSelectVariant = (color: string, ram: string, index: number) => {
    setModalVariant({ color, ram });
    setModalQuantity(1);
    
    const albumLength = product?.albumImages?.length || 0;
    const newImage = albumLength > 0
      ? product?.albumImages[index % albumLength] || product?.image || "/default-image.jpg"
      : product?.image || "/default-image.jpg";
    setModalImage(newImage);
  };

  // Get selected variant price
  const getSelectedVariantPrice = () => {
    if (!selectedVariant) {
      return product?.price ? `${Number(product.price).toLocaleString("vi-VN")} VNĐ` : "Liên hệ";
    }
    const variant = product?.variants?.find(
      (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
    );
    return variant?.price
      ? `${Number(variant.price).toLocaleString("vi-VN")} VNĐ`
      : product?.price
      ? `${Number(product.price).toLocaleString("vi-VN")} VNĐ`
      : "Liên hệ";
  };

  // Get modal variant price
  const getModalVariantPrice = () => {
    if (!modalVariant) {
      return product?.price ? `${Number(product.price).toLocaleString("vi-VN")} VNĐ` : "Liên hệ";
    }
    const variant = product?.variants?.find(
      (v) => v.color === modalVariant.color && v.ram === modalVariant.ram
    );
    return variant?.price
      ? `${Number(variant.price).toLocaleString("vi-VN")} VNĐ`
      : product?.price
      ? `${Number(product.price).toLocaleString("vi-VN")} VNĐ`
      : "Liên hệ";
  };

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (selectedVariant) {
      const variant = product?.variants?.find(
        (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      if (variant && value > variant.soluong) {
        message.warning(
          `Số lượng vượt quá tồn kho cho biến thể ${variant.color} - ${variant.ram}!`
        );
        return;
      }
    } else if (product && value > product.soluong) {
      message.warning("Số lượng vượt quá tồn kho!");
      return;
    }
    setQuantity(value);
  };

  // Handle modal quantity change
  const handleModalQuantityChange = (value: number) => {
    if (value < 1) return;
    if (modalVariant) {
      const variant = product?.variants?.find(
        (v) => v.color === modalVariant.color && v.ram === modalVariant.ram
      );
      if (variant && value > variant.soluong) {
        message.warning(
          `Số lượng vượt quá tồn kho cho biến thể ${variant.color} - ${variant.ram}!`
        );
        return;
      }
    } else if (product && value > product.soluong) {
      message.warning("Số lượng vượt quá tồn kho!");
      return;
    }
    setModalQuantity(value);
  };

  // 🔥 FUNCTION showModal - KIỂM TRA TỔNG GIÁ TRỊ ĐƠN HÀNG TRƯỚC KHI MỞ MODAL
  const showModal = (action: "buyNow" | "addToCart") => {
    if (!product) {
      message.error("Không tìm thấy sản phẩm.");
      return;
    }
    if (!product.status) {
      message.error("Sản phẩm này không còn được bán.");
      return;
    }

    // 🔥 KIỂM TRA TỔNG GIÁ TRỊ ĐƠN HÀNG TRƯỚC KHI MỞ MODAL
    const unitPrice = getCurrentPrice();
    const currentQuantity = quantity;
    
    if (isHighValueOrder(unitPrice, currentQuantity)) {
      console.log("💎 Showing contact modal for high value order");
      setContactModalAction(action);
      setIsContactModalOpen(true);
      return;
    }

    // Nếu không phải đơn hàng cao cấp, mở modal bình thường
    setModalAction(action);
    setIsModalOpen(true);
    
    if (selectedVariant) {
      setModalVariant(selectedVariant);
      setModalQuantity(quantity);
      const variantIndex = product.variants?.findIndex(
        (v) => v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      const albumLength = product?.albumImages?.length || 0;
      const imageIndex = variantIndex !== undefined && variantIndex >= 0 && albumLength > 0
        ? variantIndex % albumLength
        : 0;
      setModalImage(
        albumLength > 0
          ? product?.albumImages?.[imageIndex] || product?.image || "/default-image.jpg"
          : product?.image || "/default-image.jpg"
      );
    } else {
      setModalVariant(null);
      setModalQuantity(1);
      setModalImage(product?.image || "/default-image.jpg");
    }
  };

  // Handle modal confirmation
  const handleModalOk = async () => {
    if (!modalVariant) {
      message.warning("Vui lòng chọn biến thể.");
      return;
    }

    // 🔥 KIỂM TRA LẠI TỔNG GIÁ TRỊ TRONG MODAL
    const unitPrice = getModalCurrentPrice();
    const currentQuantity = modalQuantity;
    
    if (isHighValueOrder(unitPrice, currentQuantity)) {
      console.log("💎 Redirecting to contact modal from regular modal");
      setIsModalOpen(false);
      setContactModalAction(modalAction);
      setIsContactModalOpen(true);
      return;
    }

    // Xử lý bình thường
    if (modalAction === "addToCart") {
      await handleAddToCart();
    } else if (modalAction === "buyNow") {
      handleBuyNow();
    }
    setIsModalOpen(false);
  };

  // Handle modal cancellation
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  // 🔥 HANDLE CONTACT MODAL
  const handleContactModalOk = () => {
    navigate("/contact");
    setIsContactModalOpen(false);
    setContactModalAction(null);
  };

  const handleContactModalCancel = () => {
    setIsContactModalOpen(false);
    setContactModalAction(null);
  };

  // Add to cart
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
        message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng.");
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
      if (!modalVariant) {
        message.warning("Vui lòng chọn biến thể.");
        return;
      }
      const variant = product.variants?.find(
        (v) => v.color === modalVariant.color && v.ram === modalVariant.ram
      );
      if (!variant) {
        message.warning("Biến thể không hợp lệ hoặc không có sẵn.");
        return;
      }
      if (variant.soluong <= 0) {
        message.warning(`Biến thể ${variant.color} - ${variant.ram} đã hết hàng!`);
        return;
      }
      if (modalQuantity > variant.soluong) {
        message.warning(`Số lượng vượt quá tồn kho của biến thể ${variant.color} - ${variant.ram}!`);
        return;
      }

      const cartResponse = await axios.get(`http://localhost:5000/api/carts/${user._id}`);
      const cart = cartResponse.data;
      const cartItem = cart.items.find(
        (item: any) =>
          item.productId === product._id &&
          item.color === modalVariant.color &&
          item.storage === modalVariant.ram
      );
      let totalQuantity = modalQuantity;
      if (cartItem) {
        totalQuantity += cartItem.quantity;
      }
      if (totalQuantity > variant.soluong) {
        message.warning(
          `Tổng số lượng cho biến thể ${variant.color} - ${variant.ram} vượt quá tồn kho!`
        );
        return;
      }

      const cartItemToAdd = {
        userId: user._id,
        items: [
          {
            productId: product._id,
            quantity: modalQuantity,
            price: variant?.price || product.price,
            color: modalVariant.color,
            storage: modalVariant.ram,
            categoryId: Array.isArray(product.danhmuc)
              ? product.danhmuc[0]
              : product.danhmuc,
          },
        ],
      };

      await axios.post("http://localhost:5000/api/carts", cartItemToAdd);
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

  // Buy now
  const handleBuyNow = () => {
    if (!product || !modalVariant?.color || !modalVariant?.ram) {
      message.warning("Vui lòng chọn biến thể");
      return;
    }
    const variant = product.variants?.find(
      (v) => v.color === modalVariant.color && v.ram === modalVariant.ram
    );
    if (!variant || modalQuantity > variant.soluong) {
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
      _id: "buy-now-temp-id",
      productId: product._id,
      productName: product.name,
      image: product.image,
      price: variant.price || product.price,
      soluong: modalQuantity,
      color: modalVariant.color,
      storage: modalVariant.ram,
      categoryId,
    };

    navigate("/checkout", { state: { buyNowItem } });
  };

  // Fetch category names
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
  const displayedVariants = uniqueVariants.slice(0, 6);

  return (
    <div className="w-full h-full bg-white p-4 md:p-8">
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
                    src={img || "/placeholder.svg"}
                    alt={`variant-${idx}`}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                      mainImage === img
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
              | Trạng thái:{" "}
              <span
                className={`font-semibold ${product.soluong > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {product.soluong > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            </p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-gray-700">Tồn kho:</span>
              <span>{product.soluong || 0}</span>
            </div>
            <div className="mb-4">
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {getSelectedVariantPrice()}
              </p>
              {/* 🔥 HIỂN THỊ THÔNG BÁO CHO ĐƠN HÀNG GIÁ TRỊ CAO */}
              {isHighValueOrder(getCurrentPrice(), quantity) && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">
                    💎 Đơn hàng cao cấp (Tổng: {getCurrentTotalValue().toLocaleString("vi-VN")} VNĐ) - Vui lòng liên hệ để được tư vấn và hỗ trợ tốt nhất
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Màu sắc và Dung lượng:
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayedVariants.length > 0 ? (
                  <>
                    {displayedVariants.map((variant, idx) => (
                      <button
                        key={idx}
                        className={`relative px-2 py-1 text-xs font-medium rounded-full border bg-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                          selectedVariant?.color === variant.color &&
                          selectedVariant?.ram === variant.ram
                            ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-300"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectVariant(variant.color, variant.ram, idx)}
                      >
                        <span className="block truncate max-w-[120px]">
                          {`${variant.color} - ${variant.ram}`}
                          <br />
                        </span>
                      </button>
                    ))}
                    {uniqueVariants.length > 6 && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-600">...</span>
                    )}
                  </>
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
              <div className="mt-2 space-y-1">
                <p className="text-gray-600">
                  Tồn kho hiện có:{" "}
                  {selectedVariant
                    ? product?.variants?.find(
                        (v) =>
                          v.color === selectedVariant.color &&
                          v.ram === selectedVariant.ram
                      )?.soluong || 0
                    : product.soluong}
                </p>
                {/* 🔥 HIỂN THỊ TỔNG GIÁ TRỊ ĐƠN HÀNG */}
                <p className="text-blue-600 font-semibold">
                  Tổng giá trị: {getCurrentTotalValue().toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-md w-full">
            <button
              className="flex-1 bg-black text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => showModal("buyNow")}
              disabled={!product.status}
            >
              MUA NGAY
            </button>
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 border-2 border-red-600 text-red-600 py-2 px-6 rounded-lg font-semibold text-sm md:text-base hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => showModal("addToCart")}
              disabled={!product.status}
            >
              <ShoppingCartOutlined className="text-base" />
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <PromotionSection />
          <SupportPolicy />
        </div>
      </div>

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

      <CommentSection />
      <RelatedProducts />

      {/* 🔥 MODAL LIÊN HỆ CHO ĐƠN HÀNG GIÁ TRỊ CAO */}
      <Modal
        title={
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span>Đơn hàng cao cấp - Cần tư vấn</span>
            </div>
          </div>
        }
        open={isContactModalOpen}
        onOk={handleContactModalOk}
        onCancel={handleContactModalCancel}
        okText="Liên hệ ngay"
        cancelText="Đóng"
        width={600}
        className="rounded-lg"
        styles={{ body: { padding: "24px", background: "#fefdf8" } }}
        okButtonProps={{ 
          className: "bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 h-auto" 
        }}
        cancelButtonProps={{ 
          className: "border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 h-auto" 
        }}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💎</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Đơn hàng cao cấp trên 100 triệu VNĐ
            </h3>
            <p className="text-gray-600">
              Để đảm bảo bạn nhận được sự tư vấn tốt nhất và chính sách hỗ trợ đặc biệt
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-4">
              <img
                src={product?.image || "/default-image.jpg"}
                alt={product?.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product?.name}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Đơn giá: {getCurrentPrice().toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p className="text-sm text-gray-600">
                    Số lượng: {selectedVariant ? quantity : quantity}
                  </p>
                  <p className="text-red-600 font-bold">
                    Tổng: {getCurrentTotalValue().toLocaleString("vi-VN")} VNĐ
                  </p>
                  {selectedVariant && (
                    <p className="text-sm text-gray-600">
                      {selectedVariant.color} - {selectedVariant.ram}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              🎯 Lợi ích khi liên hệ trực tiếp:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Tư vấn chuyên sâu từ đội ngũ chuyên gia
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Chính sách ưu đãi và hỗ trợ đặc biệt cho đơn hàng lớn
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Dịch vụ giao hàng và bảo hành VIP
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Hỗ trợ trả góp 0% lãi suất cho đơn hàng lớn
              </li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Hành động: <strong>
                {contactModalAction === "buyNow" ? "Mua ngay" : "Thêm vào giỏ hàng"}
              </strong>
            </p>
            <p className="mt-1">
              Nhấn "Liên hệ ngay" để được tư vấn chi tiết về đơn hàng này
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal for variant and quantity selection */}
      <Modal
        title={
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-t-lg">
            {modalAction === "buyNow" ? "Chọn Biến Thể Để Mua Ngay" : "Chọn Biến Thể Để Thêm Vào Giỏ Hàng"}
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={modalAction === "buyNow" ? "Xác nhận mua" : "Thêm vào giỏ"}
        cancelText="Hủy"
        width={650}
        className="rounded-lg"
        styles={{ body: { padding: "24px", background: "#f9fafb" } }}
        okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold" }}
        cancelButtonProps={{ className: "border-gray-300 hover:border-gray-400 text-gray-700" }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-lg shadow-sm">
            <img
              src={modalImage || "/default-image.jpg"}
              alt="Selected variant"
              className="w-48 h-48 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {product?.name}
              </h3>
              <p className="text-red-600 font-bold text-lg mb-3">
                {getModalVariantPrice()}
              </p>
              {/* 🔥 HIỂN THỊ TỔNG GIÁ TRỊ TRONG MODAL */}
              <p className="text-blue-600 font-semibold text-lg mb-3">
                Tổng: {getModalTotalValue().toLocaleString("vi-VN")} VNĐ
              </p>
              {/* 🔥 CẢNH BÁO NẾU TỔNG GIÁ TRỊ CAO */}
              {isHighValueOrder(getModalCurrentPrice(), modalQuantity) && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs font-medium">
                    💎 Đơn hàng cao cấp - Sẽ chuyển sang tư vấn
                  </p>
                </div>
              )}
              <p className="text-gray-600">
                Tồn kho hiện có:{" "}
                <span className="font-semibold">
                  {modalVariant
                    ? product?.variants?.find(
                        (v) =>
                          v.color === modalVariant.color &&
                          v.ram === modalVariant.ram
                      )?.soluong || 0
                    : product?.soluong || 0}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Chọn Màu sắc và Dung lượng:
            </h4>
            <div className="flex flex-wrap gap-3">
              {uniqueVariants.length > 0 ? (
                uniqueVariants.map((variant, idx) => (
                  <button
                    key={idx}
                    className={`relative px-3 py-1.5 text-sm font-medium rounded-full border bg-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      modalVariant?.color === variant.color &&
                      modalVariant?.ram === variant.ram
                        ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-300"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => handleModalSelectVariant(variant.color, variant.ram, idx)}
                  >
                    <span className="block truncate max-w-[140px]">
                      {`${variant.color} - ${variant.ram}`}
                      <span className="ml-2 text-xs text-gray-500">
                        (Tồn: {variant.soluong})
                      </span>
                      <br />
                      <span className="text-xs text-red-500">
                        {Number(variant.price || 0).toLocaleString()} VNĐ
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500">Không có biến thể nào.</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-md font-semibold text-gray-800 mb-3">
              Số lượng:
            </label>
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
              <button
                className="w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center text-lg font-semibold"
                onClick={() => handleModalQuantityChange(modalQuantity - 1)}
              >
                -
              </button>
              <input
                type="number"
                value={modalQuantity}
                onChange={(e) => handleModalQuantityChange(Number(e.target.value))}
                className="w-16 text-center border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-gray-50"
                min={1}
                max={
                  modalVariant
                    ? product?.variants?.find(
                        (v) =>
                          v.color === modalVariant.color &&
                          v.ram === modalVariant.ram
                      )?.soluong || 1
                    : product?.soluong || 1
                }
              />
              <button
                className="w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center text-lg font-semibold"
                onClick={() => handleModalQuantityChange(modalQuantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Details;
