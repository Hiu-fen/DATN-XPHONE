const Cart = require("../models/cartModels");
const Product = require("../models/productModels");
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart)
      return res.status(200).json({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart)
      return res.status(200).json({ userId: req.params.userId, items: [] });
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
    res.json({ message: "Đã xóa giỏ hàng." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "items phải là một mảng và không được rỗng" });
    }

    for (const item of items) {
      if (!item.productId || !item.color || !item.storage || !item.quantity) {
        return res.status(400).json({
          message: "Mỗi sản phẩm cần có productId, color, storage và quantity",
        });
      }
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    for (const newItem of items) {
      const product = await Product.findById(newItem.productId);

      if (!product) {
        return res.status(404).json({
          message: `Không tìm thấy sản phẩm với ID ${newItem.productId}`,
        });
      }

      const variant = product.variants?.find(
        (v) => v.color === newItem.color && v.ram === newItem.storage
      );

      const price = variant?.price || product.price;
      const image = product.image || (product.albumImages?.[0] ?? "");

      const snapshotItem = {
        productId: product._id,
        categoryId: product.danhmuc || null,
        name: product.name,
        price: price,
        image:
          variant?.image ||
          product.image ||
          product.albumImages?.[0] ||
          "https://cdn-icons-png.flaticon.com/512/2748/2748558.png", // ✅ ảnh sản phẩm
        color: newItem.color,
        storage: newItem.storage,
        quantity: newItem.quantity,
      };

      const existingItem = cart.items.find(
        (i) =>
          i.productId.toString() === product._id.toString() &&
          i.color === newItem.color &&
          i.storage === newItem.storage
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        cart.items.push(snapshotItem);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Lỗi addToCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
