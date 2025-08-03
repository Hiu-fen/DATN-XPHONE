const Contact = require('../models/contactModels');

exports.getAllContact = async (req, res) => {
  try {
    const contacts = await Contact.find();
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
    const contactData = req.body;
    if (!contactData.name || !contactData.email || !contactData.phone) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc: name, email, hoặc phone' });
    }
    const contact = new Contact(contactData);
    await contact.save();
    console.log('Liên hệ đã lưu:', contact);
    const io = global._io; // Sử dụng global._io thay vì req.app.get('io')
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

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyImage, replyDate } = req.body;
    const updateData = { status };
    if (replyImage) {
      updateData.replyImage = replyImage;
    }
    if (replyDate) {
      updateData.replyDate = replyDate;
    }
    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }
    const io = global._io; // Sử dụng global._io
    if (io) {
      console.log('Phát sự kiện contactUpdated:', updatedContact);
      io.emit('contactUpdated', updatedContact);
    } else {
      console.error('Socket.IO instance không tồn tại');
    }
    res.json(updatedContact);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái liên hệ', error: error.message });
  }
};