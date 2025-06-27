import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";

interface Item {
  productName: string;
  soluong: number;
  price: number;
  snapshot: {
    image?: string;
    color?: string;
    storage?: string;
  };
}

interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  status: string;
  returnStatus?: string;
  address: string;
  total: number;
  date: string;
  isPaid?: boolean;
  refunded?: boolean;
  items: Item[];
}

const ReturnRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const reasons = [
    "Thiếu hàng",
    "Hàng lỗi, không hoạt động",
    "Không hài lòng với chất lượng",
    "Khác với mô tả",
    "Hàng đã qua sử dụng",
    "Hàng giả hàng nhái",
    "Hàng nguyên vẹn nhưng không còn nhu cầu",
    "Khác",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setToast({ type: "error", message: "Không thể tải đơn hàng" });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!reason) {
      setToast({ type: "error", message: "Vui lòng chọn lý do trả hàng" });
      return;
    }
    if (images.length < 3) {
      setToast({
        type: "error",
        message: "Vui lòng chọn ít nhất 3 ảnh minh họa",
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    const formData = new FormData();
    formData.append("returnReason", reason);
    formData.append("returnStatus", "Đang chờ duyệt");
    formData.append("note", note);
    images.forEach((image) => formData.append("images", image));

    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${id}/return`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setToast({ type: "success", message: "Gửi yêu cầu trả hàng thành công" });
      setTimeout(() => navigate("/history"), 2000);
    } catch {
      setToast({ type: "error", message: "Gửi yêu cầu thất bại" });
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 text-sm animate-pulse">
        Đang tải đơn hàng...
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <FaTimesCircle /> Không tìm thấy đơn hàng
      </div>
    );

  return (
    <div className="pt-20 pb-8 px-4 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/history"
          className="inline-flex items-center text-blue-600 hover:underline transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2 w-4 h-4" /> Quay lại lịch sử đơn
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Yêu Cầu Trả Hàng Hoàn Tiền
          </h1>
        </div>
        {/* Order Items (Display Only) */}
        <div>
          <h2 className="font-medium text-gray-800 mb-3">Thông tin sản phẩm</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {item.snapshot?.image ? (
                    <img
                      src={item.snapshot.image}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Số lượng: {item.soluong} | Giá:{" "}
                      {item.price.toLocaleString()}đ
                      {item.snapshot?.color && ` | Màu: ${item.snapshot.color}`}
                      {item.snapshot?.storage &&
                        ` | Bộ nhớ: ${item.snapshot.storage}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Reason */}
        <div>
          <h2 className="font-medium text-gray-800 mb-3">Lý do trả hàng</h2>
          <div className="grid grid-cols-1 gap-2">
            {reasons.map((r, i) => (
              <label
                key={i}
                className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  reason === r
                    ? "bg-blue-50 border-blue-300"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="text-left mt-4">
          <p className="text-sm text-gray-500 mb-1">Số tiền hoàn lại dự kiến</p>
          <div className="text-lg font-semibold text-green-600">
            {order.total.toLocaleString()} đ
          </div>
        </div>
        {/* Note */}
        <div>
          <label className="block font-medium text-gray-800 mb-2">Mô Tả</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring focus:ring-blue-100 transition-all duration-200"
            placeholder="Ghi chú thêm"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium text-gray-800 mb-2">
            Ảnh bằng chứng:
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mb-3 text-sm text-gray-600"
          />
          <p
            className={`text-xs ${
              images.length < 3 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {images.length < 3
              ? "Vui lòng chọn ít nhất 3 ảnh minh họa"
              : `${images.length} ảnh đã chọn`}
          </p>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="h-24 w-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            !reason ||
            images.length < 3 ||
            order.returnStatus === "Đang chờ duyệt" ||
            order.returnStatus === "Yêu cầu đã được duyệt"
          }
          className={`w-full px-5 py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
            reason &&
            order.returnStatus !== "Đang chờ duyệt" &&
            order.returnStatus !== "Yêu cầu đã được duyệt"
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Gửi yêu cầu
        </button>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-slide-in-right ${
              toast.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {toast.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            {toast.message}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận gửi yêu cầu
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Bạn có chắc muốn gửi yêu cầu trả hàng?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors duration-200"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnRequestDetail;
