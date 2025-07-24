import { Drawer, Input, List, Spin, Button, Space, Tooltip } from "antd";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { IProduct } from "../../../../interface/product";
import { searchProducts } from "../../../../api/client/productApiClient";

const SearchClient = () => {
  // ========== STATE ==========
  const [open, setOpen] = useState(false); // Trạng thái mở Drawer
  const [keyword, setKeyword] = useState(""); // Từ khóa đang gõ
  const [submittedKeyword, setSubmittedKeyword] = useState(""); // Từ khóa đã nhấn tìm
  const [debouncedKeyword, setDebouncedKeyword] = useState(""); // Từ khóa chờ debounce
  const [history, setHistory] = useState<string[]>([]); // Lịch sử tìm kiếm
  const [showSuggestions, setShowSuggestions] = useState(false); // Hiện danh sách gợi ý
  const [hasSearched, setHasSearched] = useState(false); // Đã nhấn tìm kiếm hay chưa
  const [showAllHistory, setShowAllHistory] = useState(false); // ✅ Xem tất cả / thu gọn

  // ========== HÀM LƯU LỊCH SỬ ==========
  const saveHistory = (newKeyword: string) => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;

    // Thêm từ khóa mới và loại bỏ trùng lặp
    const updated = [trimmed, ...history.filter((item) => item !== trimmed)];
    const sliced = updated.slice(0, 20); // Chỉ lấy 20 từ gần nhất
    setHistory(sliced);
    localStorage.setItem("search_history", JSON.stringify(sliced)); // Lưu local
  };

  // ========== LẤY LỊCH SỬ TỪ LOCAL STORAGE ==========
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("search_history");
      if (stored) setHistory(JSON.parse(stored));
    }
  }, [open]);

  // ========== DEBOUNCE INPUT ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = keyword.trim();
      setDebouncedKeyword(trimmed);
      setShowSuggestions(!!trimmed); // Chỉ hiển thị gợi ý khi có nội dung
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // ========== ESCAPE ĐỂ ĐÓNG ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // ========== XỬ LÝ KHI TÌM KIẾM ==========
  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setSubmittedKeyword(trimmed);
    saveHistory(trimmed);
    setShowSuggestions(false);
    setHasSearched(true); // Đánh dấu là đã tìm kiếm chính thức
  };

  const handleDeleteHistoryItem = (itemToDelete: string) => {
    const updated = history.filter((item) => item !== itemToDelete);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  // ========== API TÌM KIẾM ==========
  const { data: products, isLoading } = useQuery<IProduct[]>({
    queryKey: ["search-products", debouncedKeyword],
    queryFn: () => searchProducts(debouncedKeyword),
    enabled: !!debouncedKeyword && open, // ✅ Chỉ gọi khi Drawer mở và có keyword
    staleTime: 1000 * 60, // Cache 1 phút
  });

  // ========== ĐÓNG DRAWER ==========
  const handleCloseDrawer = () => {
    setOpen(false);
    setKeyword("");
    setSubmittedKeyword("");
    setDebouncedKeyword("");
    setShowSuggestions(false);
    setHasSearched(false); // Reset trạng thái tìm kiếm
  };

  return (
    <>
      {/* ICON SEARCH */}
      <Tooltip title="Tìm kiếm" color="blue">
        <button
          onClick={() => setOpen(true)}
          className="text-xl text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <SearchOutlined style={{ fontSize: 20 }} />
        </button>
      </Tooltip>

      {/* DRAWER TÌM KIẾM */}
      <Drawer
        title="Tìm kiếm sản phẩm"
        placement="right"
        onClose={handleCloseDrawer}
        open={open}
        width={600}
        height={500}
      >
        {/* Ô tìm kiếm */}
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="Nhập tên sản phẩm..."
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            size="large"
            onPressEnter={handleSearch}
          />
          <Button
            icon={<SearchOutlined />}
            size="large"
            type="primary"
            onClick={handleSearch}
          />
        </Space.Compact>

        {/* ========== GỢI Ý SẢN PHẨM ==========
            ✅ Dùng antd List để hiển thị gợi ý (gọn gàng hơn, dễ xử lý click).
            ✅ Đã bổ sung saveHistory() khi click gợi ý.
        */}
        {showSuggestions && products && products.length > 0 && (
          <List
            size="small"
            bordered
            className="mt-2 max-h-64 overflow-y-auto"
            dataSource={products}
            renderItem={(item) => (
              <List.Item
                key={item._id}
                onClick={() => {
                  saveHistory(item.name); // ✅ Lưu lịch sử khi click
                  handleCloseDrawer();
                }}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                <Link to={`/detail/${item._id}`} className="block w-full">
                  {item.name}
                </Link>
              </List.Item>
            )}
          />
        )}

        {/* ========== LỊCH SỬ TÌM KIẾM ==========
            ✅ Chỉ hiện khi không có keyword đang nhập.
            ✅ Có thể click vào lịch sử để tìm lại.
        */}
        {history.length > 0 && !keyword && (
          <div className="mt-4">
            <h4 className="text-gray-600 mb-2">Lịch sử tìm kiếm:</h4>
            <List
              size="small"
              dataSource={showAllHistory ? history : history.slice(0, 5)}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <CloseOutlined
                      key="delete"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn mở tìm kiếm khi bấm xóa
                        handleDeleteHistoryItem(item);
                      }}
                      style={{ color: "#4B5563", fontSize: "12px", cursor: "pointer" }}
                    />
                  ]}
                  className="cursor-pointer hover:text-blue-500 transition"
                  onClick={() => {
                    setKeyword(item);
                    setSubmittedKeyword(item);
                    saveHistory(item);
                    setHasSearched(true);
                  }}
                >
                  {item}
                </List.Item>
              )}
            />
            {history.length > 5 && (
              <div className="text-right mt-2">
                <button
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {showAllHistory ? "Thu gọn" : "Xem tất cả"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========== KẾT QUẢ CHÍNH THỨC ==========
            ✅ Chỉ hiển thị khi đã nhấn tìm kiếm và không phải gợi ý.
        */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : hasSearched &&
            submittedKeyword &&
            !showSuggestions &&
            products ? (
            products.length > 0 ? (
              <List
                dataSource={products}
                bordered
                renderItem={(item) => (
                  <List.Item>
                    <Link
                      to={`/detail/${item._id}`}
                      onClick={handleCloseDrawer}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-blue-600 hover:underline">
                        {item.name}
                      </span>
                    </Link>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center text-gray-500 mt-4">
                Không tìm thấy sản phẩm nào phù hợp với từ khóa{" "}
                <strong>"{submittedKeyword}"</strong>
              </div>
            )
          ) : null}
        </div>
      </Drawer>
    </>
  );
};

export default SearchClient;
