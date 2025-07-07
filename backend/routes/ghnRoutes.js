const express = require('express');
const router = express.Router();
const ghnController = require('../controllers/ghnController');

router.get('/provinces', ghnController.getProvinces);
router.get('/districts', ghnController.getDistricts);
router.get('/wards', ghnController.getWards);
router.post('/calculate-fee', ghnController.calculateShippingFee);


module.exports = router;
