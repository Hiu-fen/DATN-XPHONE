const express = require('express');
const router = express.Router();
const cartControllers = require('../controllers/cartControllers');

router.post('/', cartControllers.addToCart);

router.get('/:userId',cartControllers.getCart);
router.get('/:userId',cartControllers.getCartById);
router.put('/:userId', cartControllers.updateCart);


module.exports = router;

