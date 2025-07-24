const Banner = require('../models/bannerModels');

// Lấy tất cả banner
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 }); // Sắp xếp tăng dần
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy banner theo id
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm banner
exports.createBanner = async (req, res) => {
  try {
    const { order } = req.body;

    // Kiểm tra nếu đã có banner cùng order
    const existing = await Banner.findOne({ order });
    if (existing) {
      return res.status(400).json({ message: `Số thứ tự (order) ${order} đã tồn tại.` });
    }

    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Sửa banner
exports.updateBanner = async (req, res) => {
  try {
    const { order } = req.body;
    const { id } = req.params;

    // Nếu cập nhật order, kiểm tra trùng (loại trừ chính nó)
    if (order !== undefined) {
      const existing = await Banner.findOne({ order, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Số thứ tự (order) ${order} đã tồn tại.` });
      }
    }

    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });

    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    res.json({ message: 'Đã xóa banner' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật trạng thái banner
exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra kiểu dữ liệu boolean
    if (typeof status !== 'boolean') {
      return res.status(400).json({ message: 'Giá trị status phải là true hoặc false' });
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Không tìm thấy banner' });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy banner có status = true và lọc theo vị trí (nếu có)
exports.getActiveBanners = async (req, res) => {
  try {
    const { position } = req.query; // Lấy vị trí từ query param

    const query = { status: true };

    if (position) {
      query.position = position; // Nếu có vị trí thì thêm vào query
    }

    const banners = await Banner.find(query).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


