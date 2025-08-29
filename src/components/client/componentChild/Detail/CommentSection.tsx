import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { MoreOutlined } from "@ant-design/icons";
import { AiOutlineLike } from "react-icons/ai";
import { IComment } from "../../../../interface/comments";

const CommentSection = () => {
  const { id } = useParams();
  const { confirm } = Modal;
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!userInfo?.name;

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
      message.error("Không thể tải bình luận!");
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
      const interval = setInterval(fetchComments, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) {
      message.warning("Nội dung bình luận không được để trống!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/comments", {
        sanpham: id,
        user: userInfo.name,
        content: newComment.trim(),
        date: new Date().toISOString(),
        status: false,
        likes: 0,
      });
      setComments([res.data, ...comments]);
      setNewComment("");
      message.success("Bình luận đã được gửi, chờ phê duyệt!");
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      message.error("Gửi bình luận thất bại!");
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string) => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập để like. Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`
      );
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data : c))
      );
      message.success("Đã thích bình luận!");
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
      message.error("Lỗi khi thích bình luận!");
    }
  };

  const toggleMenu = (commentId: string) =>
    setActiveMenuId((prev) => (prev === commentId ? null : commentId));

  const startEdit = (comment: IComment) => {
    if (comment.user !== userInfo?.name) {
      return message.warning("Bạn chỉ có thể chỉnh sửa bình luận của mình!");
    }
    setEditingId(comment._id);
    setEditContent(comment.content);
    setActiveMenuId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editContent.trim()) {
      return message.warning("Nội dung không được để trống!");
    }

    try {
      const res = await axios.patch( 
        `http://localhost:5000/api/comments/${editingId}`,
        { content: editContent.trim() }
      );

      setComments((prev) =>
        prev.map((c) => (c._id === editingId ? res.data : c))
      );

      message.success("Cập nhật bình luận thành công!");
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("❌ Lỗi cập nhật bình luận:", error);
      message.error("Không thể cập nhật bình luận!");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const deleteComment = (commentId: string) => {
    confirm({
      title: "Xác nhận xóa bình luận",
      content: "Bạn có chắc chắn muốn xóa bình luận này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
          message.success("Xóa bình luận thành công!");
          fetchComments();
          setActiveMenuId(null);
        } catch (error) {
          console.error("Lỗi xóa bình luận:", error);
          message.error("Xóa bình luận thất bại!");
        }
      },
    });
  };

  const approvedComments = comments.filter((c) => c.status);

  return (
    <section className="max-w-3xl mx-auto mt-12 px-4 md:px-0">
      <h6 className="text-gray-800 font-semibold text-lg mb-4">
        Bình luận sản phẩm
      </h6>

      <div className="bg-white rounded-lg shadow p-4">
        <textarea
          rows={3}
          placeholder={
            isLoggedIn
              ? "Viết bình luận của bạn..."
              : "Bạn cần đăng nhập để bình luận"
          }
          className={`w-full p-3 text-sm rounded-md border resize-none focus:outline-none transition ${isLoggedIn
            ? "border-gray-300 focus:ring-1 focus:ring-blue-500"
            : "border-red-400 bg-red-50 placeholder-red-500 font-semibold"
            }`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isLoggedIn}
        />
        <div className="text-right mt-3">
          <button
            disabled={loading || !isLoggedIn}
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {approvedComments
          .slice(0, showAll ? approvedComments.length : 2)
          .map((comment) => {
            const isOwner = comment.user === userInfo?.name;
            return (
              <div
                key={comment._id}
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition text-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        {comment.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    {isOwner && (
                      <div className="relative">
                        <button
                          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
                          onClick={() => toggleMenu(comment._id)}
                        >
                          <MoreOutlined />
                        </button>
                        {activeMenuId === comment._id && (
                          <div className="absolute right-0 mt-6 bg-white border border-gray-200 rounded-md shadow-lg z-10 text-xs">
                            <button
                              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                              onClick={() => startEdit(comment)}
                            >
                              ✏️ Chỉnh sửa
                            </button>
                            <button
                              className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                              onClick={() => deleteComment(comment._id)}
                            >
                              🗑 Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2">
                      {editingId === comment._id ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full h-20 border border-gray-300 rounded resize-none text-sm p-2 focus:ring-1 focus:ring-blue-500"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-xs"
                              onClick={saveEdit}
                            >
                              💾 Lưu
                            </button>
                            <button
                              className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 text-xs"
                              onClick={cancelEdit}
                            >
                              ❌ Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700">{comment.content}</p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      >
                        <AiOutlineLike /> Thích
                      </button>
                      <span className="text-gray-600">
                        {comment.likes ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {approvedComments.length > 2 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-5 py-2 bg-gray-100 text-blue-600 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
              {showAll ? "⬆️ Thu gọn" : "⬇️ Xem thêm"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentSection;