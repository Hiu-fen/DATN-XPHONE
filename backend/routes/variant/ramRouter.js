// routes/ramRouter.js
const express = require('express'), c = require('../../controllers/variant/ramController');
const router = express.Router();
router.get('/', c.getAll);
router.post('/',c.create);
router.put('/:id',c.update);
router.get('/:id',c.getDetail);
router.delete('/:id',c.delete);
module.exports = router;
