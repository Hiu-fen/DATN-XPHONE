// routes/colorRouter.js
const express = require('express'), c = require('../../controllers/variant/colorController');
const router = express.Router();
router.get('/', c.getAll);
router.post('/',c.create);
router.put('/:id',c.update);
router.delete('/:id',c.delete);
module.exports = router;
