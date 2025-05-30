const express = require('express');
const router = express.Router();
const commentControllers = require('../controllers/commentControllers');

router.get('/', commentControllers.getAllComment);

router.post('/', commentControllers.createComment);

router.delete('/:id', commentControllers.deleteComment);

router.patch('/:id', commentControllers.updateComment);


module.exports = router;
