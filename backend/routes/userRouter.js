const express = require('express');
const router = express.Router();
const {
  register,
  login,
  listAdmins,
  listClients,
  getProfile,
  updateUserStatus,
  updateProfile,
  registerWithGoogle,
  loginWithGoogle,
  getUpdateHistory,
  changePassword,
  getAllUpdateHistories,
  User_likeProduct, // like handler bạn đã định nghĩa
  userController_getLikedProducts,
 
} = require('../controllers/userControllers');

const User = require('../models/userModels');

// Auth + profile
router.post('/register', register);
router.post('/login', login);
router.post('/google-register', registerWithGoogle);
router.post('/google-login', loginWithGoogle);

router.get('/admins', listAdmins);
router.get('/clients', listClients);
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);
router.patch('/:id', updateUserStatus);
router.get('/history/all', getAllUpdateHistories);

router.patch('/change-password/:id', changePassword);

// ✅ Route like sản phẩm
router.patch('/:id/like', User_likeProduct);
router.get('/:id/liked-products', userController_getLikedProducts);


// ✅ Lấy user theo email
// router.get('/', async (req, res) => {
//   try {
//     const email = req.query.email;
//     if (!email) return res.status(400).json({ message: 'Thiếu email' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

//     return res.json(user);
//   } catch (error) {
//     console.error('Lỗi server:', error);
//     return res.status(500).json({ message: 'Lỗi server' });
//   }
// });
// ✅ Lấy tất cả user (dùng cho lọc địa chỉ)
router.get('/', async (req, res) => {
  try {
    const email = req.query.email;

    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
      return res.json(user);
    }

    // ✅ Nếu không có email, trả về tất cả user (dùng cho dropdown lọc địa chỉ)
    const users = await User.find({}, "_id name email role ");
    return res.json(users);
  } catch (error) {
    console.error('Lỗi server:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

// ✅ Lấy thông tin user theo id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});



module.exports = router;
