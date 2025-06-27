const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// Thống kê tổng quan dashboard
router.get('/dashboard', statisticsController.getDashboardStats);

// Thống kê theo ngày
router.get('/daily', statisticsController.getDailyStats);

// Thống kê theo khoảng thời gian
router.get('/range', statisticsController.getStatsByDateRange);

// Thống kê doanh thu từng ngày trong tháng
router.get('/daily-in-month', statisticsController.getDailyRevenueInMonth);

// Thống kê top 3 sản phẩm bán chạy nhất
router.get('/top-selling-products', statisticsController.getTopSellingProducts);

module.exports = router; 