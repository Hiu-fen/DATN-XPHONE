const Address = require("../models/address");

// GET: Danh sách địa chỉ theo user
exports.getAddressesByUser = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy địa chỉ" });
  }
};
exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find().populate('userId'); // Có thể populate để lấy thêm thông tin user nếu cần
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy tất cả địa chỉ" });
  }
};


// POST: Thêm địa chỉ
exports.addAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.body.userId }, { isDefault: false });
    }
    const newAddress = new Address(req.body);
    const saved = await newAddress.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm địa chỉ" });
  }
};

// PATCH: Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.body.userId }, { isDefault: false });
    }
    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật địa chỉ" });
  }
};

// DELETE: Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Xoá thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá địa chỉ" });
  }
};
