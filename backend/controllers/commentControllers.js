const Comment = require('../models/commentModels');

exports.getAllComment = async (req, res) =>{
    try {
        const comments = await Comment.find()
        res.json(comments)
    } catch (error) {
        res.status(500).json({message:'Lỗi khi lấy liên hệ'})   
    }
}
exports.createComment = async (req, res) =>{
    try {
        // console.log(req.body);
        const commentData = req.body
        const comment = new Comment(commentData);
        await comment.save();
        res.status(201).json(comment)
    } catch (error) {
        res.status(500).json({message:'Lỗi khi tạo liên hệ'})   
    }
}


exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedComment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }

    res.json(updatedComment);
  } catch (error) {
    console.error('Lỗi cập nhật bình luận:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};



exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteComment = await Comment.findByIdAndDelete(id);

    if (!deleteComment) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ để xóa' });
    }

    res.json({ message: 'Xóa liên hệ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa liên hệ' });
  }
};
