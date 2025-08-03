const Ram = require('../../models/variant/ramModel');

exports.create = async (req, res) => {
  try {
    console.log('Payload nhận được:', req.body);
    const ram = new Ram(req.body);
    await ram.save();
    res.status(201).json(ram);
  } catch (e) {
    console.error('Lỗi tạo RAM:', e);
    res.status(500).json({ message: 'Lỗi tạo RAM', error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    console.log('Payload cập nhật:', req.body);
    const ram = await Ram.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ram) return res.status(404).json({ message: 'Không tìm thấy RAM' });
    res.json(ram);
  } catch (e) {
    console.error('Lỗi cập nhật RAM:', e);
    res.status(500).json({ message: 'Lỗi cập nhật RAM', error: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const variantCategory = req.query.variantCategory;
    const query = variantCategory
      ? { variantCategory: { $in: variantCategory.split(',') } }
      : {};
    const rams = await Ram.find(query).populate('variantCategory', 'name');
    res.json(rams);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy danh sách RAM', error: e.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const ram = await Ram.findById(req.params.id).populate('variantCategory', 'name');
    if (!ram) return res.status(404).json({ message: 'Không tìm thấy RAM' });
    res.json(ram);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết RAM', error: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const ram = await Ram.findByIdAndDelete(req.params.id);
    if (!ram) return res.status(404).json({ message: 'Không tìm thấy RAM' });
    res.json({ message: 'Xóa RAM thành công' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi xóa RAM', error: e.message });
  }
};