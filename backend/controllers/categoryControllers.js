const Category = require('../models/categoryModels');

exports.getAllCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.json(category);
  } catch (error) {
    console.error("❌ Lỗi getAllCategory:", error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (error) {
    console.error("❌ Lỗi getCategoryById:", error);
    res.status(500).json({ message: 'Lỗi khi lấy danh mục' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();

    res.status(201).json(newCategory);

    // Gửi realtime sau khi phản hồi thành công
    if (req.io) {
      req.io.emit("categoryCreated", newCategory);
    }
  } catch (error) {
    console.error("❌ Lỗi createCategory:", error);
    res.status(500).json({ message: 'Lỗi khi tạo danh mục' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy danh mục để cập nhật' });

    res.json(updated);

    // Gửi realtime sau khi phản hồi thành công
    if (req.io) {
      req.io.emit("categoryUpdated", updated);
    }
  } catch (error) {
    console.error("❌ Lỗi updateCategory:", error);
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục để xoá' });

    res.json({ message: 'Xoá danh mục thành công' });

    // Gửi realtime sau khi phản hồi thành công
    if (req.io) {
      req.io.emit("categoryDeleted", deleted._id);
    }
  } catch (error) {
    console.error("❌ Lỗi deleteCategory:", error);
    res.status(500).json({ message: 'Lỗi khi xoá danh mục' });
  }
};
