const Color = require('../../models/variant/colorModel');

exports.create = async (req, res) => {
  try {
    console.log('Payload nhận được:', req.body);
    const color = new Color(req.body);
    await color.save();
    res.status(201).json(color);
  } catch (e) {
    console.error('Lỗi tạo màu:', e);
    res.status(500).json({ message: 'Lỗi tạo màu', error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    console.log('Payload cập nhật:', req.body);
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!color) return res.status(404).json({ message: 'Không tìm thấy màu' });
    res.json(color);
  } catch (e) {
    console.error('Lỗi cập nhật màu:', e);
    res.status(500).json({ message: 'Lỗi cập nhật màu', error: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const variantCategory = req.query.variantCategory;
    const query = variantCategory
      ? { variantCategory: { $in: variantCategory.split(',') } }
      : {};
    const colors = await Color.find(query).populate('variantCategory', 'name');
    res.json(colors);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy danh sách màu', error: e.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id).populate('variantCategory', 'name');
    if (!color) return res.status(404).json({ message: 'Không tìm thấy màu' });
    res.json(color);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết màu', error: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) return res.status(404).json({ message: 'Không tìm thấy màu' });
    res.json({ message: 'Xóa màu thành công' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi xóa màu', error: e.message });
  }
};