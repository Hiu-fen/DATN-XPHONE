const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionControllers');

router.get('/', promotionController.getAllPromotions);
router.post('/', promotionController.createPromotion);
router.post('/apply-voucher-order', promotionController.applyVoucherToOrder);
router.get('/random-code', promotionController.getRandomCode);
router.patch('/:id/status', promotionController.updateStatus);
router.get('/:id', promotionController.getPromotionById);
router.put('/:id', promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
