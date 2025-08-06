const User = require('../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key_here';
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('104260804254-l5u6m93mdepqjvt00oqj0fimtpmj3eg6.apps.googleusercontent.com'); // bạn phải thay đúng Client ID


// Đăng ký người dùng mới
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      active: true,
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    if (!user.active) return res.status(403).json({ message: 'Tài khoản bị khóa' });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ message: 'Đăng nhập thành công', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách Admin
exports.listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách người dùng (user)
exports.listClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'user' });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
// lấy tất cả danh sách người dùng

// Cập nhật trạng thái người dùng (active, role,...)
exports.updateUserStatus = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
  }
};

// Lấy thông tin hồ sơ người dùng (profile) theo ID
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const { name, email, password, avatar, sdt, address, notification, gender, dob } = req.body;

    const changes = []; // ✅ Khai báo mảng để lưu lịch sử thay đổi

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
      changes.push(`Email: ${user.email} → ${email}`);
      user.email = email;
    }

    if (name && name !== user.name) {
      changes.push(`Tên: ${user.name} → ${name}`);
      user.name = name;
    }
    if (avatar && avatar !== user.avatar) {
      changes.push(`Ảnh đại diện đã thay đổi`);
      user.avatar = avatar;
    }
    if (sdt && sdt !== user.sdt) {
      changes.push(`Số điện thoại: ${user.sdt || 'Chưa có'} → ${sdt}`);
      user.sdt = sdt;
    }
    if (address && address !== user.address) {
      changes.push(`Địa chỉ: ${user.address || 'Chưa có'} → ${address}`);
      user.address = address;
    }
    if (gender && gender !== user.gender) {
      changes.push(`Giới tính: ${user.gender || 'Chưa có'} → ${gender}`);
      user.gender = gender;
    }
    if (dob && dob !== user.dob) {
      changes.push(`Ngày sinh: ${user.dob || 'Chưa có'} → ${dob}`);
      user.dob = dob;
    }
    if (password && password !== '') {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
      changes.push(`Đã thay đổi mật khẩu`);
    }

    if (notification && notification !== user.notification) {
      changes.push(`Thông báo: ${user.notification || 'Chưa có'} → ${notification}`);
      user.notification = notification;
    }

    // ✅ Ghi lịch sử
    if (changes.length > 0) {
      if (!Array.isArray(user.updateHistory)) {
        user.updateHistory = [];
      }

      user.updateHistory.unshift({
        content: changes.join(' | '),
        time: new Date(),
      });
    }

    await user.save();
    res.json({ message: 'Cập nhật thành công', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


exports.getAllUpdateHistories = async (req, res) => {
  try {
    const users = await User.find({ updateHistory: { $exists: true, $ne: [] } }, "email updateHistory");
    const allHistories = [];

    users.forEach((user) => {
      user.updateHistory.forEach((entry) => {
        allHistories.push({
          email: user.email,
          time: entry.time,
          content: entry.content,
        });
      });
    });

    // Sắp xếp theo thời gian mới nhất
    allHistories.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(allHistories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử" });
  }
};


// Đăng ký với Google
exports.registerWithGoogle = async (req, res) => {
  const { name, email, avatar } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại. Vui lòng đăng nhập.' });
    }

    const user = new User({
      name,
      email,
      avatar,
      password: '',
      provider: 'google',
      role: 'user',
      active: true,
    });

    await user.save();

    return res.status(201).json({ message: 'Đăng ký Google thành công' });
  } catch (err) {
    console.error('Lỗi đăng ký Google:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
// Đăng nhập với Google
exports.loginWithGoogle = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Tài khoản chưa tồn tại. Vui lòng đăng ký.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

    return res.json({ token, user });
  } catch (err) {
    console.error('Lỗi đăng nhập Google:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
// controllers/productController.js
exports.User_likeProduct = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

  const hasLiked = user.like.includes(productId);

  user.like = hasLiked
    ? user.like.filter((id) => id !== productId)
    : [...user.like, productId];

  await user.save();
  res.json({ liked: !hasLiked, likeList: user.like });
};
// const User = require('../models/userModels');
const Product = require('../models/productModels');
exports.userController_getLikedProducts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.like) {
      return res.status(404).json({ message: "Không tìm thấy người dùng hoặc danh sách yêu thích" });
    }

    const likedProducts = await Product.find({ _id: { $in: user.like } });
    return res.json(likedProducts);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    // Ghi lại lịch sử thay đổi
    if (!Array.isArray(user.updateHistory)) user.updateHistory = [];
    user.updateHistory.unshift({
      content: 'Đã đổi mật khẩu',
      time: new Date(),
    });

    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu' });
  }
};

