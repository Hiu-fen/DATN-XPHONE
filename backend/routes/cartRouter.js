const express = require('express');
const router = express.Router();
const cartControllers = require('../controllers/cartControllers');

router.post('/', cartControllers.addToCart);

router.get('/:userId',cartControllers.getCart);
router.put('/:userId', cartControllers.updateCart);
router.delete('/:userId', cartControllers.deleteCart);

module.exports = router;

