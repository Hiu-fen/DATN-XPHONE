const Promotion = require('../models/promotionModels');

// Hàm để tạo mã khuyến mãi ngẫu nhiên
exports.getRandomCode = (req, res) => {
  const length = 8; 
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  res.json({ code: result });
};


// Hàm để lấy tất cả danh sách khuyến mãi
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy danh sách khuyến mãi." });
  }
};

// Hàm để tạo khuyến mãi mới
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (err) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ, không thể tạo khuyến mãi." });
  }
};

// Hàm để lấy khuyến mãi theo ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: "Không tìm thấy khuyến mãi." });
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy thông tin khuyến mãi." });
  }
};

// Hàm để cập nhật khuyến mãi
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promotion) return res.status(404).json({ message: "Không tìm thấy khuyến mãi để cập nhật." });
    res.json(promotion);
  } catch (err) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ, không thể cập nhật khuyến mãi." });
  }
};

// Hàm để xóa khuyến mãi
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: "Không tìm thấy khuyến mãi để xóa." });
    res.json({ message: "Đã xóa khuyến mãi thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể xóa khuyến mãi." });
  }
};
