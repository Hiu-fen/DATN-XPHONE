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
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// ✅ Cập nhật hồ sơ người dùng (profile)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const { name, email, password, avatar, sdt, address, notification } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (sdt) user.sdt = sdt;
    if (address) user.address = address;
    if (notification) user.notification = notification;

    if (password && password !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
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