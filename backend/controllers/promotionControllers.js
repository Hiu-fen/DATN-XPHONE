const Promotion = require('../models/promotionModels');
const mongoose = require('mongoose');
const Product = require('../models/productModels');
const Notification = require('../models/notificationModels');
const Order = require("../models/orderModel");

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
    const promotions = await Promotion.find()
      .sort({ status: -1, createdAt: -1 })
      .populate('applicableCategories', '_id name');
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy danh sách khuyến mãi." });
  }
};

exports.getUsersUsedPromotion = async (req, res) => {
  try {
    const code = req.params.code;

    // Tìm các đơn hàng có dùng mã khuyến mãi
    const orders = await Order.find({ voucherCode: code })
      .select("customerName phone email orderCode date total isPaid paymentMethod status")
      .lean();

    res.json({ users: orders });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách người dùng mã:", err);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu sử dụng mã" });
  }
};

exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      status: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      quantity: { $gt: 0 },
    })
      .populate("applicableCategories", "name") 
      .select("-__v"); // loại bỏ __v

    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy khuyến mãi", error: err.message });
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
      const updatePromises = expiredPromotions.map(async (promo) => {
        await Promotion.findByIdAndUpdate(promo._id, { status: false });

        await Notification.create({
          message: `Khuyến mãi "${promo.name}" đã hết hạn`,
          scope: 'admin',
          type: 'promotion',
          relatedId: promo._id,
          role: 'admin',
        });
      });

      await Promise.all(updatePromises);
      console.log(`✅ Đã tắt ${expiredPromotions.length} khuyến mãi hết hạn và tạo thông báo.`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi tự động cập nhật trạng thái khuyến mãi:', error);
  }
};

const checkCondition = (condition, order) => {
  // Kiểm tra tổng giá trị đơn hàng
  if (condition.minOrderValue && order.total < condition.minOrderValue) {
    return `Đơn hàng phải từ ${condition.minOrderValue} VNĐ để áp dụng mã.`;
  }

  // Kiểm tra số lượng sản phẩm
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  if (condition.minQuantity && totalQuantity < condition.minQuantity) {
    return `Bạn phải mua ít nhất ${condition.minQuantity} sản phẩm để áp dụng mã.`;
  }

  return null;
};


// Hàm xử lý khi áp mã giảm giá
exports.applyVoucherToOrder = async (req, res) => {
  try {
    const { code, total, items, userId } = req.body;

    if (!code || !total || !items || items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin." });
    }

    const voucher = await Promotion.findOne({ code });
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy mã khuyến mãi." });

    // Kiểm tra người dùng đã dùng mã này bao nhiêu lần
    const usedCount = await Order.countDocuments({
      userId, 
      voucherCode: code,
    });

    if (voucher.maxUsagePerUser && usedCount >= voucher.maxUsagePerUser) {
      return res.status(400).json({
        message: "Bạn đã dùng mã này quá số lần cho phép.",
      });
    }

    if (!voucher.status) return res.status(400).json({ message: "Mã khuyến mãi đã bị khóa." });

    if (new Date(voucher.endDate) < new Date()) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết hạn." });
    }

    if (voucher.quantity <= 0) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết lượt sử dụng." });
    }

    // ===== ✅ Xử lý kiểm tra danh mục áp dụng
    if (voucher.applicableCategories?.length > 0) {
      const allowedCategories = voucher.applicableCategories.map(id => id.toString());

      const extractCategoryId = (categoryId) => {
        if (!categoryId) return "";
        if (typeof categoryId === "string") return categoryId;
        if (typeof categoryId === "object" && categoryId.$oid) return categoryId.$oid;
        return categoryId.toString();
      };

      const valid = items.some((i) =>
        allowedCategories.includes(extractCategoryId(i.categoryId))
      );

      if (!valid) {
        return res.status(400).json({
          message: "Mã này không áp dụng cho sản phẩm trong đơn hàng.",
        });
      }
    }

    // ✅ Check điều kiện trường condition
    const error = checkCondition(voucher.condition, { total, items });
    if (error) {
      return res.status(400).json({ message: error });
    }

    // ===== ✅ Tính giảm giá
    let discountAmount = 0;

    if (voucher.discountType === "fixed") {
      discountAmount = voucher.discountValue || 200000;
    } else if (voucher.discountType === "percent") {
      discountAmount = (voucher.discountValue / 100) * total;

      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === "free_ship") {
      discountAmount = 40000;
    }

    if (discountAmount > total) {
      discountAmount = total;
    }

    const finalPrice = total - discountAmount;

    return res.status(200).json({
      message: "Áp dụng mã thành công.",
      discountAmount,
      finalPrice,
      voucherCode: code,
    });
  } catch (err) {
    console.error("❌ Lỗi khi áp dụng voucher:", err);
    return res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
};
