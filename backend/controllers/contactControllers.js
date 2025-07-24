const { message } = require('antd');
const Contact = require('../models/contactModels');

exports.getAllContact = async (req, res) =>{
    try {
        const contacts = await Contact.find()
        res.json(contacts)
    } catch (error) {
        res.status(500).json({message:'Lỗi khi lấy liên hệ'})   
    }
}

exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết liên hệ' });
  }
};

exports.createContact = async (req, res) =>{
    try {
        // console.log(req.body);
        const contactData = req.body
        const contact = new Contact(contactData);
        await contact.save();
        res.status(201).json(contact)
    } catch (error) {
        res.status(500).json({message:'Lỗi khi tạo liên hệ'})   
    }
}
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    }

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái liên hệ' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteContact = await Contact.findByIdAndDelete(id);

    if (!deleteContact) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ để xóa' });
    }

    res.json({ message: 'Xóa liên hệ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa liên hệ' });
  }
};

