
const PostAddPromotion = () => {

    return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm khuyến mãi</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên khuyến mãi</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã khuyến mãi</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
                <option value="">-- Chọn loại giảm giá --</option>
                <option value="freeShip">Miễn phí ship</option>
                <option value="sale20%">Giảm giá 20%</option>
                <option value="sale50k">Giảm giá 50k</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm áp dụng</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
                <option value="">-- Chọn sản phẩm --</option>
                <option value="Iphone">IPhone</option>
                <option value="SamSung">SamSung</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện áp dụng</label>
          <input
            type="text"
            placeholder="Không bắt buộc"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Hết hạn</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Thêm khuyến mãi
        </button>
      </form>
    </div>
  );

}

export default PostAddPromotion
