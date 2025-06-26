const Cart = require('../models/cartModels');
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(200).json({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(200).json({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCart = async (req, res) => {
  const { items } = req.body;
  try {
    cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = new Cart({ userId: req.params.userId, items });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'Đã xóa giỏ hàng.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "items phải là một mảng" });
    }

    // Kiểm tra xem mỗi item có đầy đủ thông tin hay không
    for (const item of items) {
      if (!item.productId || !item.color || !item.storage || !item.quantity) {
        return res.status(400).json({ message: "Mỗi sản phẩm cần có productId, color, storage và quantity" });
      }
      
      if (!item.categoryId) {
        return res.status(400).json({ message: "Thiếu categoryId của sản phẩm" });
      }
    }


    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Nếu chưa có giỏ hàng, tạo mới
      cart = new Cart({ userId, items });
    } else {
      // Nếu đã có giỏ hàng, xử lý thêm hoặc cập nhật sản phẩm
      items.forEach(newItem => {
        const existingItem = cart.items.find(item =>
          item.productId.toString() === newItem.productId.toString() &&
          item.color === newItem.color &&
          item.storage === newItem.storage
        );

        if (existingItem) {
          // Nếu sản phẩm đã có trong giỏ hàng, cộng thêm số lượng
          existingItem.quantity += newItem.quantity;
        } else {
          // Nếu chưa có sản phẩm, thêm mới vào giỏ hàng
          cart.items.push(newItem);
        }
      });
    }

    // Lưu giỏ hàng vào database
    await cart.save();
    res.status(200).json(cart);

  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};