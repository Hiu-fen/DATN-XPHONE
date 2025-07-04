const express = require("express");
const router = express.Router();
const ghnController = require("../controllers/ghn.Controller");

router.get("/provinces", ghnController.getProvinces);
router.get("/districts/:provinceId", ghnController.getDistricts);
router.get("/wards/:districtId", ghnController.getWards);
router.post("/calculate-fee", ghnController.calculateShippingFee);


module.exports = router;
