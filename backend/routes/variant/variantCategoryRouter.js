const express = require('express');
const vc = require('../../controllers/variant/variantCategoryController');
const router = express.Router();

router.get('/', vc.getAll);
router.post('/', vc.create);
router.put('/:id', vc.update);
router.get('/:id', vc.getDetail);
router.delete('/:id', vc.delete);

module.exports = router;