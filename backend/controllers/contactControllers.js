const Contact = require('../models/contactModels');

exports.getAllContact = async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const contacts = await Contact.find(query);
    res.json(contacts);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách liên hệ:', error);
    res.status(500).json({ message: 'Lỗi khi lấy liên hệ' });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết liên hệ:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết liên hệ' });
  }
};

exports.createContact = async (req, res) => {
  try {
    console.log('Dữ liệu nhận được:', req.body);
    const { name, email, phone, conversation } = req.body;
    if (!name || !email || !phone || !conversation || !conversation[0]) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc: name, email, phone, hoặc conversation' });
    }
    const contact = new Contact({ name, email, phone, conversation, status: false });
    await contact.save();
    console.log('Liên hệ đã lưu:', contact);
    const io = global._io;
    if (io) {
      io.emit('contactCreated', contact);
      console.log('Phát sự kiện contactCreated:', contact);
    } else {
      console.error('Socket.IO instance không tồn tại');
    }
    res.status(201).json(contact);
  } catch (error) {
    console.error('Lỗi khi tạo liên hệ:', error);
    res.status(500).json({ message: 'Lỗi khi tạo liên hệ', error: error.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Thiếu nội dung phản hồi' });
    }
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }
    contact.conversation.push({
      sender: 'admin',
      content,
      timestamp,
    });
    contact.status = true;
    await contact.save();
    const io = global._io;
    if (io) {
      console.log('Phát sự kiện contactUpdated:', contact);
      io.emit('contactUpdated', contact);
    } else {
      console.error('Socket.IO instance không tồn tại');
    }
    res.json(contact);
  } catch (error) {
    console.error('Lỗi khi thêm phản hồi:', error);
    res.status(500).json({ message: 'Lỗi khi thêm phản hồi', error: error.message });
  }
};

exports.updateContactConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { conversation } = req.body;
    if (!conversation || !conversation.content) {
      return res.status(400).json({ message: 'Thiếu nội dung tin nhắn' });
    }
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }
    contact.conversation.push({
      sender: 'client',
      content: conversation.content,
      image: conversation.image,
      timestamp: conversation.timestamp,
    });
    contact.status = false; // Set status to false when client sends a new message
    contact.updatedAt = new Date();
    await contact.save();
    const io = global._io;
    if (io) {
      console.log('Phát sự kiện contactUpdated:', contact);
      io.emit('contactUpdated', contact);
    } else {
      console.error('Socket.IO instance không tồn tại');
    }
    res.status(200).json({ message: 'Cập nhật tin nhắn thành công', contact });
  } catch (error) {
    console.error('Lỗi khi cập nhật tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật tin nhắn', error: error.message });
  }
};