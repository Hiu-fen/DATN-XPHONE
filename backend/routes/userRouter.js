const express = require('express');
const router = express.Router();
// <<<<<<< Updated upstream
const { register, login, listAdmins, listClients,getProfile,  updateUserStatus, updateProfile,registerWithGoogle,loginWithGoogle } = require('../controllers/userControllers');
// =======
const User = require('../models/userModels'); // Đường dẫn đúng

// const {
//   register,
//   login,
//   listAdmins,
//   listClients,
//   getProfile,
//   updateUserStatus,
//   updateProfile,
// } = require('../controllers/userControllers');


router.post('/register', register);
router.post('/login', login);
router.get('/admins', listAdmins);
router.get('/clients', listClients);
router.post('/google-register', registerWithGoogle);

// Route đăng nhập Google
router.post('/google-login', loginWithGoogle);;

// router.get('/profile/:id', getProfile);
router.patch('/:id', updateUserStatus); 
router.put('/profile/:id', updateProfile); 

router.get('/profile/:id', getProfile);
router.patch('/:id', updateUserStatus);



// Route lấy user theo email
router.get('/', async (req, res) => {  // <-- sửa thành '/'
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Thiếu email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Lỗi server:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
