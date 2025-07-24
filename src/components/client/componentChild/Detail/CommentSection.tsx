import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useParams } from "react-router-dom";
import { MoreOutlined } from "@ant-design/icons";
import { IComment } from "../../../../interface/comments";

const CommentSection = () => {
  const { id } = useParams();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Lấy bình luận
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
      }
    };
    if (id) fetchComments();
  }, [id]);

  // Gửi bình luận
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      const userName = userInfo?.name || "Khách hàng";

      const res = await axios.post("http://localhost:5000/api/comments", {
        sanpham: id,
        user: userName,
        content: newComment.trim(),
        date: new Date().toISOString(),
        status: false,
        likes: 0,
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

  const handleLike = async (commentId: string) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data : c))
      );
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
    }
  };

  const toggleMenu = (commentId: string) => {
    setActiveMenuId((prev) => (prev === commentId ? null : commentId));
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
      const res = await axios.put(
        `http://localhost:5000/api/comments/${editingId}`,
        { content: editContent.trim() }
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

  return (
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
  );
};

export default CommentSection;
