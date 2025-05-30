const express = require('express');
const router = express.Router();
const contactControllers = require('../controllers/contactControllers');

router.get('/', contactControllers.getAllContact);

router.post('/', contactControllers.createContact);

router.delete('/:id', contactControllers.deleteContact);

router.patch('/:id', contactControllers.updateContactStatus);


module.exports = router;
