const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy danh sách đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy đơn hàng theo id
router.get('/:id', orderController.getOrderById);


module.exports = router;
