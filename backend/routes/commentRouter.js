const express = require('express');
const router = express.Router();
const commentControllers = require('../controllers/commentControllers');

// Get all comments (for admin)
router.get('/', commentControllers.getAllComment);

// Get comments by product ID
router.get('/:id', commentControllers.getCommentsByProduct);

// Create a new comment
router.post('/', commentControllers.createComment);

// Update a comment
router.patch('/:id', commentControllers.updateComment);

// Delete a comment
router.delete('/:id', commentControllers.deleteComment);

// Like a comment
router.post('/:id/like', commentControllers.likeComment);

module.exports = router;