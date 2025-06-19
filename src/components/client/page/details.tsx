import {
  PhoneOutlined,
  TruckOutlined,
  GiftOutlined,
  CheckOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IProduct } from "../../../interface/product";
import { IComment } from "../../../interface/comments";
import { addToCart } from "../../../api/cartApi";
import { message } from "antd";
import { useQuery } from "@tanstack/react-query";

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  // Danh Sách Bình Luận
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<{
    color: string;
    ram: string;
  } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const navigate = useNavigate();
  const relatedProductsRef = useRef<HTMLDivElement>(null);

  // Fetch related products
  useEffect(() => {
    let isMounted = true;
    if (product?.danhmuc) {
      const fetchRelated = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/products`);
          if (isMounted) {
            const filtered = res.data.filter(
              (p: IProduct) =>
                p._id !== product._id && p.danhmuc === product.danhmuc
            );
            setRelatedProducts(filtered.slice(0, 4));
          }
        } catch (error) {
          console.error("Lỗi lấy sản phẩm liên quan:", error);
          message.error("Không thể tải sản phẩm liên quan.");
        }
      };
      fetchRelated();
    }
    return () => {
      isMounted = false;
    };
  }, [product]);
  // Fetch product details
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
        console.error("Failed to fetch product:", error);
        message.error("Không thể tải thông tin sản phẩm.");
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);
  // Lấy toàn bộ danh sách bình luận
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
      }
    };
    fetchComments();
  }, [id]);
  // Thêm bình luận
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      // Lấy user từ localStorage nếu có
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      const userName = userInfo?.name || "Khách hàng";

      const res = await axios.post("http://localhost:5000/api/comments", {
        sanpham: product?._id,
        user: userName,
        content: newComment.trim(),
        date: new Date().toISOString(),
        status: false,
        likes: 0
      });

      setComments([res.data, ...comments]);
      setNewComment("");
      message.success("Bình luận của bạn đã được gửi thành công, chờ phê duyệt!");
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      message.error("Gửi bình luận thất bại!");
    }
    setLoading(false);
  };
  // Like Bình Luận
  const handleLike = async (commentId: string) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`
      );
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? res.data : comment
        )
      );
    } catch (error) {
      console.error("Lỗi khi tăng like:", error);
    }
  };
  // Comment menu states and functions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const toggleMenu = (commentId: string) => {
    if (activeMenuId === commentId) setActiveMenuId(null);
    else setActiveMenuId(commentId);
  };
  const startEdit = (comment: IComment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
    setActiveMenuId(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };
  // Sửa bình luận
  const saveEdit = async () => {
    if (!editContent.trim()) return alert("Nội dung không được để trống");
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${editingId}`,
        {
          content: editContent.trim(),
        }
      );
      setComments((prev) =>
        prev.map((c) => (c._id === editingId ? res.data : c))
      );
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Lỗi cập nhật bình luận:", error);
    }
  };
  // Xóa bình luận
  const deleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setActiveMenuId(null);
    } catch (error) {
      console.error("Lỗi xóa bình luận:", error);
    }
  };
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
      // Kiểm tra số lượng biến thể
      const variant = product.variants?.find(
        (v) =>
          v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      if (variant && quantity > variant.soluong) {
        message.warning(
          `Số lượng vượt quá tồn kho của biến thể ${variant.color} - ${variant.ram}!`
        );
        return;
      }
      await addToCart({
        userId: user._id,
        productId: product._id,
        quantity: quantity,
        price: product.price,
        color: selectedVariant.color,
        storage: selectedVariant.ram,
      });
      message.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      message.error("Thêm vào giỏ hàng thất bại.");
    }
  };


  const handleAddToCart1 = async () => {
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
      // Kiểm tra số lượng biến thể
      const variant = product.variants?.find(
        (v) =>
          v.color === selectedVariant.color && v.ram === selectedVariant.ram
      );
      if (variant && quantity > variant.soluong) {
        message.warning(
          `Số lượng vượt quá tồn kho của biến thể ${variant.color} - ${variant.ram}!`
        );
        return;
      }
      await addToCart({
        userId: user._id,
        productId: product._id,
        quantity: quantity,
        price: product.price,
        color: selectedVariant.color,
        storage: selectedVariant.ram,
      });
      navigate(`/checkout`);
    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      message.error("Mua hàng thất bại.");
    }
  };

  // Scroll related products
  const scrollRelatedProducts = (direction: "left" | "right") => {
    if (relatedProductsRef.current) {
      const scrollAmount = 300;
      relatedProductsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
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
              | Trạng thái:{" "}
              <span className="text-green-600 font-semibold">
                {product.trangthai || "Không xác định"}
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
            <div className="space-y-2 text-gray-700 mb-6">
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Sản phẩm chính hãng, nguyên seal</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Đổi trả trong 7 ngày nếu lỗi kỹ thuật</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Bảo hành theo chính sách của hãng</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-md w-full">
            <button
              className="flex-1 bg-black text-white py-2 px-6 rounded-lg font-semibold text-sm md:text-base hover:bg-gray-800 transition-all duration-200 flex flex-col items-center leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart1}
              disabled={!product.status}
            >
              MUA NGAY
              <span className="text-[11px] text-gray-300 mt-0.5 text-center">
                Nhận tại nhà hoặc cửa hàng
              </span>
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
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <div className="bg-white rounded-md shadow-sm border border-red-400">
            <div className="bg-red-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold text-base justify-center rounded-t-md">
              <GiftOutlined className="text-lg" />
              <span>Khuyến mãi đặc biệt</span>
            </div>
            <div className="p-3 text-sm text-gray-700 space-y-1">
              <p>
                - Giảm{" "}
                <span className="text-red-600 font-semibold">250.000đ</span> khi
                mua kèm gói bảo hành VIP 12 tháng 1 Đổi 1.
              </p>
              <p>
                - Trả góp qua Home PayLater giảm thêm 5% tối đa{" "}
                <span className="text-red-600 font-semibold">500.000đ</span>.
              </p>
              <p>
                - Hỗ trợ trả góp 0% chỉ cần CCCD gắn chip hoặc 0% qua thẻ tín
                dụng.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-800">
            <div className="bg-gray-900 text-white px-3 py-1.5 flex items-center gap-2 font-semibold text-base justify-center rounded-t-md">
              <StarOutlined className="text-lg" />
              <span>Chính sách hỗ trợ</span>
            </div>
            <table className="w-full text-sm border-separate border-spacing-y-1 px-3 py-2">
              <tbody>
                {[
                  {
                    icon: <TruckOutlined className="text-xl text-gray-600" />,
                    title: "Vận chuyển miễn phí",
                    desc: "Đơn hàng từ 2 triệu",
                  },
                  {
                    icon: <GiftOutlined className="text-xl text-gray-600" />,
                    title: "Quà tặng",
                    desc: "Ưu đãi đặc biệt theo mùa",
                  },
                  {
                    icon: <CheckOutlined className="text-xl text-gray-600" />,
                    title: "Cam kết chất lượng",
                    desc: "100% chính hãng",
                  },
                  {
                    icon: <PhoneOutlined className="text-xl text-gray-600" />,
                    title: "Hotline: 0789182477",
                    desc: "Hỗ trợ từ 8h - 22h",
                  },
                ].map((item, idx) => (
                  <tr key={idx} className="bg-gray-50 rounded-md">
                    <td className="w-10 text-center py-2 align-top">
                      {item.icon}
                    </td>
                    <td className="py-2 align-top">
                      <div>
                        <span className="font-semibold">{item.title}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {item.desc}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Mô tả */}
      <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 border-b-4 border-gray-300 pb-3">
          MÔ TẢ SẢN PHẨM
        </h2>
        <div className="text-gray-700 text-base md:text-lg leading-relaxed max-w-3xl mx-auto space-y-5 px-2 md:px-0">
          <p>{product.mota || "Không có mô tả."}</p>
        </div>
      </section>
      {/* Bình Luận */}
      <section className="max-w-3xl mx-auto mt-12 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <h6 className="text-black-500 font-semibold text-sm md:text-base">
            Bình luận sản phẩm
          </h6>
        </div>
        <textarea
          rows={3}
          placeholder="Viết bình luận của bạn..."
          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-blue-500 mt-3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button
          disabled={loading}
          onClick={handleAddComment}
          className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 text-sm"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
        </button>
        <div className="mt-5 space-y-3">
          {comments
            .filter((comment) => comment.status)
            .map((comment) => (
              <div
                key={comment._id}
                className="p-3 border border-gray-200 rounded-md relative text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{comment.user}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.date).toLocaleString("vi-VN")}
                  </span>
                  <button
                    className="ml-2 p-1 text-gray-600 hover:text-gray-900"
                    onClick={() => toggleMenu(comment._id)}
                  >
                    <MoreOutlined />
                  </button>
                  {activeMenuId === comment._id && (
                    <div className="absolute top-7 right-3 bg-white border border-gray-300 rounded shadow-md z-10 text-xs">
                      <button
                        className="block px-3 py-1 hover:bg-gray-100 w-full text-left"
                        onClick={() => startEdit(comment)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="block px-3 py-1 hover:bg-gray-100 w-full text-left text-red-600"
                        onClick={() => deleteComment(comment._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                {editingId === comment._id ? (
                  <>
                    <textarea
                      className="w-full h-16 border border-gray-300 rounded resize-none text-sm"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                        onClick={saveEdit}
                      >
                        Lưu
                      </button>
                      <button
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-xs"
                        onClick={cancelEdit}
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-700">{comment.content}</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    👍 Like
                  </button>
                  <span>{comment.likes ?? 0}</span>
                </div>
              </div>
            ))}
        </div>
      </section>
      {/* Sản phẩm liên quan */}
      <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0 relative">
        <div className="flex items-center gap-3">
          <div className=" bg-red-500 w-[30px] rounded-lg h-[50px]" />
          <h6 className=" text-red-500 font-semibold">Sản phẩm liên quan</h6>
        </div>
        <br />
        <button
          onClick={() => scrollRelatedProducts("left")}
          className="hidden md:flex absolute -left-16 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 z-10 shadow"
        >
          <LeftOutlined className="text-3xl" />
        </button>
        <div className="relative">
          <div
            ref={relatedProductsRef}
            className="flex overflow-x-auto gap-4 scrollbar-hide max-w-[1008px]"
          >
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item) => (
                <Link
                  to={`/detail/${item._id}`}
                  key={item._id}
                  className="flex-shrink-0 w-60 border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <img
                    src={item.image || "/default-image.jpg"}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-lg truncate">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-red-600 font-bold">
                        {item.price || "Liên hệ"}
                      </p>
                      <button className="text-gray-600 hover:text-red-600">
                        <ShoppingCartOutlined className="text-xl" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>Không có sản phẩm liên quan.</p>
            )}
          </div>
        </div>
        <button
          onClick={() => scrollRelatedProducts("right")}
          className="hidden md:flex absolute -right-16 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 z-10 shadow"
        >
          <RightOutlined className="text-3xl" />
        </button>
      </section>
    </div>
  );
};

export default Details;
