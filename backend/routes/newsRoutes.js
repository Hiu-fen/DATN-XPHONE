const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.get('/', newsController.getAllNews);
router.get('/published', newsController.getAllPublishedNews);
router.get('/:id', newsController.getNewsById);
router.get('/admin/:id', newsController.adminGetNewsById);
router.patch('/status/:id', newsController.updateNewsStatus);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router; 