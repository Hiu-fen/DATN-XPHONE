const Promotion = require('../models/promotionModels');
const Cart = require('../models/cartModels');
const mongoose = require('mongoose');
const Product = require('../models/productModels');
const Notification = require('../models/notificationModels');
const { getIO } = require('../socket');

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

// Hàm để cập nhật trạng thái khuyến mãi
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// Hàm để lấy tất cả danh sách khuyến mãi
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate('applicableCategories', '_id name');
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
    const promotion = await Promotion.findById(req.params.id).populate('applicableCategories', '_id name');
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

// Hàm tự động vô hiệu hóa các khuyến mãi đã hết hạn
exports.autoDisableExpiredPromotions = async () => {
  try {
    const now = new Date();

    const expiredPromotions = await Promotion.find({
      status: true,
      endDate: { $lt: now },
    });

    if (expiredPromotions.length > 0) {
      const io = getIO();

      const updatePromises = expiredPromotions.map(async (promo) => {
        await Promotion.findByIdAndUpdate(promo._id, { status: false });

        const notification = await Notification.create({
          message: `Khuyến mãi "${promo.name}" đã hết hạn`,
          scope: 'admin',
          type: 'warning',
          relatedId: promo._id,
        });

        io.to('admin').emit('new_notification', notification); // Gửi socket tới admin
      });

      await Promise.all(updatePromises);
      console.log(`✅ Đã tắt ${expiredPromotions.length} khuyến mãi hết hạn và gửi thông báo.`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi tự động cập nhật trạng thái khuyến mãi:', error);
  }
};

exports.applyVoucher = async (req, res) => {
  try {
    const { code, userId, totalOrderValue } = req.body;

    if (!code || !userId || !totalOrderValue) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const voucher = await Promotion.findOne({ code });
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy mã khuyến mãi." });

    if (!voucher.status) return res.status(400).json({ message: "Mã khuyến mãi đã bị khóa." });
    if (new Date(voucher.endDate) < new Date()) {
      return res.status(400).json({ message: "Mã đã hết hạn." });
    }

    if (voucher.quantity <= 0) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết lượt sử dụng." });
    }
    // if (voucher.minOrderValue && totalOrderValue < voucher.minOrderValue) {
    //   return res.status(400).json({
    //     message: `Đơn hàng tối thiểu là ${voucher.minOrderValue.toLocaleString()} VNĐ.`,
    //   });
    // }

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng đang trống." });
    }

    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (voucher.applicableCategories && voucher.applicableCategories.length > 0) {
      const applicableCategoryIds = voucher.applicableCategories.map(cat => cat.toString());

      const hasApplicable = products.some(product => {
        if (!product || !product.danhmuc) return false;
        return applicableCategoryIds.includes(product.danhmuc.toString());
      });

      if (!hasApplicable) {
        return res.status(400).json({ message: "Mã này không áp dụng cho các sản phẩm không có trong danh mục cho phép." });
      }
    }

    // Tính giảm giá
    let discountAmount = 0;

    if (voucher.discountType === "fixed") {
      discountAmount = 200000;
    } else if (voucher.discountType === "percent") {
      discountAmount = (voucher.discountValue / 100) * totalOrderValue;
    } else if (voucher.discountType === "free_ship") {
      discountAmount = 40000;
    }

    if (discountAmount > totalOrderValue) {
      discountAmount = totalOrderValue;
    }

    voucher.quantity -= 1;
    voucher.usageCount = (voucher.usageCount || 0) + 1;

     await voucher.save();

    return res.status(200).json({
      message: "Áp dụng mã thành công.",
      discountAmount,
      finalPrice: totalOrderValue - discountAmount,
      voucherCode: code,
    });

  } catch (err) {
    console.error("Lỗi khi áp dụng voucher:", err);
    return res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
};
