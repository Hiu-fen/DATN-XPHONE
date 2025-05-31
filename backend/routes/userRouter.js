const express = require('express');
const router = express.Router();
const { register, login, listAdmins, listClients, getProfile, updateUserStatus } = require('../controllers/userControllers');

router.post('/register', register);
router.post('/login', login);
router.get('/admins', listAdmins);
router.get('/clients', listClients);
router.get('/profile/:id', getProfile);
router.patch('/:id', updateUserStatus); // ✅ THÊM DÒNG NÀY



module.exports = router;
