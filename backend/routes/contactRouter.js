const express = require('express');
const router = express.Router();
const contactControllers = require('../controllers/contactControllers');

router.get('/', contactControllers.getAllContact);
router.get('/:id', contactControllers.getContactById);
router.post('/', contactControllers.createContact);
router.patch('/:id/reply', contactControllers.addReply);

module.exports = router;