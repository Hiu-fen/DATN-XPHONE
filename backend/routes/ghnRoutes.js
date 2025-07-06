const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee
} = require('../controllers/ghnController');

router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);
router.get('/wards', getWards);
router.post('/calculate-fee', calculateShippingFee);

module.exports = router;
