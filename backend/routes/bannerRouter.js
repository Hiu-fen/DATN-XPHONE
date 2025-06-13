const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerControllers');

router.get('/', bannerController.getAllBanners);
router.get('/active', bannerController.getActiveBanners);
router.get('/:id', bannerController.getBannerById);
router.patch('/status/:id', bannerController.updateBannerStatus);
router.post('/', bannerController.createBanner);
router.put('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;