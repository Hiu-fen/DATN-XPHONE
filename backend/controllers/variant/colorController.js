// controllers/colorControllers.js
const Color = require('../../models/variant/colorModel');

exports.getAll = async (req, res) => {
  try { res.json(await Color.find()) }
  catch(e){ res.status(500).json({message:'Lỗi lấy màu'}) }
};
exports.create   = async (req,res) => {
  try { const c = new Color(req.body); await c.save(); res.status(201).json(c) }
  catch(e){ res.status(500).json({message:'Lỗi tạo màu'}) }
};
exports.update   = async (req,res) => {
  try {
    const c = await Color.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if(!c) return res.status(404).json({message:'Không tìm thấy màu'});
    res.json(c);
  } catch(e){ res.status(500).json({message:'Lỗi cập nhật màu'}) }
};
exports.delete   = async (req,res) => {
  try {
    const c = await Color.findByIdAndDelete(req.params.id);
    if(!c) return res.status(404).json({message:'Không tìm thấy màu'});
    res.json({message:'Xóa thành công'});
  } catch(e){ res.status(500).json({message:'Lỗi xóa màu'}) }
};
