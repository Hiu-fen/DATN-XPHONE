// controllers/ramControllers.js
const Ram = require('../../models/variant/ramModel');

exports.getAll = async (req, res) => {
  try { res.json(await Ram.find()) }
  catch(e){ res.status(500).json({message:'Lỗi lấy RAM'}) }
};
exports.create = async (req,res) => {
  try { const r = new Ram(req.body); await r.save(); res.status(201).json(r) }
  catch(e){ res.status(500).json({message:'Lỗi tạo RAM'}) }
};
exports.update = async (req,res) => {
  try {
    const r = await Ram.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if(!r) return res.status(404).json({message:'Không tìm thấy RAM'});
    res.json(r);
  } catch(e){ res.status(500).json({message:'Lỗi cập nhật RAM'}) }
};
exports.delete = async (req,res) => {
  try {
    const r = await Ram.findByIdAndDelete(req.params.id);
    if(!r) return res.status(404).json({message:'Không tìm thấy RAM'});
    res.json({message:'Xóa thành công'});
  } catch(e){ res.status(500).json({message:'Lỗi xóa RAM'}) }
};
