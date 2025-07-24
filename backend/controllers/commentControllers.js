const Comment = require('../models/commentModels');

// Get all comments (optional, keep for admin purposes)
exports.getAllComment = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận' });
  }
};

// Get comments by product ID
exports.getCommentsByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ sanpham: id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Lỗi khi lấy bình luận theo sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi lấy bình luận' });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const commentData = req.body;
    const comment = new Comment(commentData);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    res.status(500).json({ message: 'Lỗi khi tạo bình luận' });
  }
};

// Update a comment
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

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận để xóa' });
    }
    res.json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    res.status(500).json({ message: 'Lỗi khi xóa bình luận' });
  }
};

// Like a comment (optional, if you want to implement like functionality)
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    comment.likes = (comment.likes || 0) + 1;
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error('Lỗi khi tăng like:', error);
    res.status(500).json({ message: 'Lỗi khi tăng like' });
  }
};