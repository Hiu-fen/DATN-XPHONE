import {
  PhoneOutlined,
  TruckOutlined,
  GiftOutlined,
  CheckOutlined,
  ShoppingCartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IProduct } from "../../../interface/product";
import { IComment } from "../../../interface/comments";

import { MoreOutlined } from "@ant-design/icons"; 
import { addToCart } from "../../../api/cartApi";
import { message } from "antd";



const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product]);

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/comments", {
        sanpham: product?._id,
        user: "Khách hàng",
        content: newComment.trim(),
      });
      console.log("Sending comment for productId:", product?._id);

      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
    }
    setLoading(false);
  };
  const handleLike = async (commentId: string) => {
  try {
    const res = await axios.post(`http://localhost:5000/api/comments/${commentId}/like`);
    // Cập nhật lại bình luận trong state
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId ? res.data : comment
      )
    );
  } catch (error) {
    console.error("Lỗi khi tăng like:", error);
  }
};
    
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

const saveEdit = async () => {
  if (!editContent.trim()) return alert("Nội dung không được để trống");
  try {
    const res = await axios.put(`http://localhost:5000/api/comments/${editingId}`, {
      content: editContent.trim(),
    });
    setComments((prev) =>
      prev.map((c) => (c._id === editingId ? res.data : c))
    );
    setEditingId(null);
    setEditContent("");
  } catch (error) {
    console.error("Lỗi cập nhật bình luận:", error);
  }
};

// Hàm xóa bình luận
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

const nav = useNavigate()

const handleAddToCart = async () => {
  try {
     const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id){
        message.warning("Bạn cần đăng nhập để mua hàng.");
        nav("/login")
        return
      } 
    if (!product?._id) return message.warning("Không tìm thấy sản phẩm.");
    if(!product?.soluong){
      product?.soluong > 0
   message.warning("Sản phẩm đã hết hàng ")
       return
    }

    await addToCart({
      userId: user._id,
      productId: product._id,
      quantity: 1,  
      color: "",    
      storage: "",  
    });

    message.success("Đã thêm vào giỏ hàng!");
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);
   message.warning("Thêm vào giỏ hàng thất bại.");
  }
};

const handleAddToCart1 = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id){
        message.warning("Bạn cần đăng nhập để mua hàng.");
        nav("/login")
        return
      } 
    if (!product?._id) return message.warning("Không tìm thấy sản phẩm.");
    if(!product?.soluong){
      product?.soluong > 0
    message.warning("Sản phẩm đã hết hàng ")
       return
    }


    await addToCart({
      userId: user._id,
      productId: product._id,
      quantity: 1,  
      color: "",    
      storage: "",  
    });

    nav(`/cart/${user?._id}`)
  } catch (error) {
    console.error("Lỗi mua hàng :", error);
    alert("Mua thất bại ");
  }
};




  if (!product) return <div className="p-10 text-center">Đang tải sản phẩm...</div>;

  return (
    <div className="bg-white min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        {/* Ảnh sản phẩm */}
        <div className="flex-1 mr-8">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
          />
          <div className="flex justify-center gap-4 mt-4">
            {product.albumImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`variant-${idx}`}
                onClick={() => setMainImage(img)}
                className={`w-20 h-28 rounded-md cursor-pointer border-4 transition ${
                  mainImage === img
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-3">
              Danh mục: <span className="font-semibold">{product.danhmuc}</span> | Trạng thái:{" "}
              <span className="text-green-600 font-semibold">{product.trangthai}</span>
            </p>
            <div className="mb-6">
              <p className="text-3xl font-semibold text-red-600">{product.price} ₫</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Chọn màu sắc:</h3>
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-blue-600 cursor-pointer shadow-md"></span>
                <span className="w-8 h-8 rounded-full bg-white border border-gray-300 cursor-pointer shadow-sm"></span>
                <span className="w-8 h-8 rounded-full bg-purple-700 border border-gray-300 cursor-pointer shadow-sm"></span>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 mb-8">
              <div className="flex items-center gap-3">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Sản phẩm chính hãng, nguyên seal</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Đổi trả trong 7 ngày nếu lỗi kỹ thuật</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckOutlined className="text-green-600 text-xl" />
                <p>Bảo hành theo chính sách của hãng</p>
              </div>
            </div>
            <div className="flex items-center gap-4 max-w-xs mb-8">
              <span className="text-lg font-semibold">Số lượng còn:</span>
              <span className="text-xl font-bold text-red-600">{product.soluong}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
            className="flex-[3] bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition flex flex-col items-center"
            onClick={handleAddToCart1}
            >
              MUA NGAY
              <span className="block text-xs text-gray-300 mt-1">
                Giao hàng tận nơi hoặc nhận tại cửa hàng
              </span>
            </button>
            <button 
            className="flex-[2] flex items-center gap-2 border border-red-600 text-red-600 py-4 rounded-full font-semibold text-lg hover:bg-red-50 transition justify-center"
            onClick={handleAddToCart}
            >
              <ShoppingCartOutlined style={{ fontSize: 24 }}  />
              Thêm vào giỏ
            </button>
          </div>
        </div>

        {/* Chính sách hỗ trợ */}
        <div className="flex-[0.8] bg-white p-4 max-h-[350px]">
          <div className="bg-black text-white px-4 py-2 flex items-center gap-2 font-semibold text-lg justify-center">
            <StarOutlined />
            <span>Chính sách hỗ trợ</span>
          </div>
          <table className="w-full border border-gray-300 rounded-lg table-fixed">
            <tbody>
              {[{
                  icon: <TruckOutlined className="text-2xl text-gray-600" />,
                  title: "Vận chuyển miễn phí",
                  desc: "Đơn hàng từ 2 triệu",
                },
                {
                  icon: <GiftOutlined className="text-2xl text-gray-600" />,
                  title: "Quà tặng",
                  desc: "Ưu đãi đặc biệt theo mùa",
                },
                {
                  icon: <CheckOutlined className="text-2xl text-gray-600" />,
                  title: "Cam kết chất lượng",
                  desc: "100% chính hãng",
                },
                {
                  icon: <PhoneOutlined className="text-2xl text-gray-600" />,
                  title: "Hotline: 0789182477",
                  desc: "Hỗ trợ từ 8h - 22h",
                }
              ].map((item, idx, arr) => (
                <tr key={idx} className={`${idx !== arr.length - 1 ? "border-b border-gray-300" : ""}`}>
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


      <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0">
        <h2 className="text-4xl font-semibold text-center mb-8 border-b-4 border-gray-300 pb-4">
          MÔ TẢ SẢN PHẨM
        </h2>
        <div className="text-gray-700 text-lg leading-relaxed space-y-6 max-w-3xl mx-auto">
          <p>{product.mota}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0">
        <h2 className="text-3xl font-semibold mb-6">Bình luận sản phẩm</h2>
        <textarea
          rows={4}
          placeholder="Viết bình luận của bạn..."
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:border-blue-500"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button
          disabled={loading}
          onClick={handleAddComment}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
          
        </button>
        <br /> <br />

     {comments
  .filter(comment => comment.status)
  .map((comment) => (
    <div key={comment._id} className="p-4 border border-gray-200 rounded-md relative">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">{comment.user}</span>
        <span className="text-sm text-gray-500">
          {new Date(comment.date).toLocaleString("vi-VN")}
        </span>
        <button
          className="ml-2 p-1 text-gray-600 hover:text-gray-900"
          onClick={() => toggleMenu(comment._id)}
        >
          <MoreOutlined />
        </button>

        {activeMenuId === comment._id && (
          <div className="absolute top-8 right-4 bg-white border border-gray-300 rounded shadow-md z-10">
            <button
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => startEdit(comment)}
            >
              Chỉnh sửa
            </button>
            <button
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
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
            className="w-full h-7 border border-gray-300 rounded resize-none"
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={saveEdit}
            >
              Lưu
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
              onClick={cancelEdit}
            >
              Hủy
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-700">{comment.content}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
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


      </section>
      
    </div>
  );
};

export default Details;

