const VariantCategory = require('../../models/variant/variantCategoryModel');

exports.getAll = async (req, res) => {
  try {
    res.json(await VariantCategory.find());
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy danh mục biến thể' });
  }
};

exports.create = async (req, res) => {
  try {
    const vc = new VariantCategory(req.body);
    await vc.save();
    res.status(201).json(vc);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi tạo danh mục biến thể' });
  }
};

exports.update = async (req, res) => {
  try {
    const vc = await VariantCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vc) return res.status(404).json({ message: 'Không tìm thấy danh mục biến thể' });
    res.json(vc);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục biến thể' });
  }
};

exports.delete = async (req, res) => {
  try {
    const vc = await VariantCategory.findByIdAndDelete(req.params.id);
    if (!vc) return res.status(404).json({ message: 'Không tìm thấy danh mục biến thể' });
    res.json({ message: 'Xóa thành công' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi xóa danh mục biến thể' });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const vc = await VariantCategory.findById(req.params.id);
    if (!vc) return res.status(404).json({ message: 'Không tìm thấy danh mục biến thể' });
    res.json(vc);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết danh mục biến thể' });
  }
};