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
    if (!userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data" });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items });
    } else {
      items.forEach(newItem => {
        const existingItem = cart.items.find(item =>
          item.productId.toString() === newItem.productId.toString() &&
          item.color === newItem.color &&
          item.storage === newItem.storage &&
          item.price === newItem.price
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};