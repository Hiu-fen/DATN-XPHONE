import { message, Modal, Input, Button as AntButton } from 'antd';
import { MapPin, Phone, Mail, Clock, Upload, LogOut } from 'lucide-react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Upload as AntdUpload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { io, Socket } from 'socket.io-client';
import { IContact, IMessage } from '../../../../interface/contact';

const { TextArea } = Input;

interface User {
  _id: string;
  email: string;
  role: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    mota: string;
    image?: string;
  }>({
    name: '',
    email: '',
    phone: '',
    mota: '',
    image: undefined,
  });

  const [uploading, setUploading] = useState(false);
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        if (user.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
          setIsAuthenticated(true);
          return user.email;
        }
      } catch (error) {
        console.error('Invalid user data:', error);
        message.error('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
      }
    }
    setIsAuthenticated(false);
    return null;
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('userEmail');
  //   setFormData({ name: '', email: '', phone: '', mota: '', image: undefined });
  //   setContacts([]);
  //   setIsAuthenticated(false);
  //   message.success('Đã đăng xuất thành công!');
  // };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchContactsByEmail = async (email: string) => {
    if (!email) return;
    const token = localStorage.getItem('token');
    try {
      setConnectionError(false);
      const response = await axios.get(`http://localhost:5000/api/contacts?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedContacts = response.data.sort((a: IContact, b: IContact) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setContacts(sortedContacts);
    } catch (error) {
      console.error('Lỗi tải lịch sử liên hệ:', error);
      message.error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!');
      setConnectionError(true);
    }
  };

  const uploadImage = async (file: RcFile) => {
    setUploading(true);
    const formData = new FormData();
    const publicId = `contact_image_${Date.now()}`;
    formData.append('file', file);
    formData.append('upload_preset', 'datn-xphone');

    try {
      console.log('Uploading to Cloudinary:', { publicId, file });
      const { data } = await axios.post('https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, image: data.secure_url }));
      message.success('Tải ảnh thành công');
      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary error:', error.response?.data);
      message.error(error.response?.data?.error?.message || 'Lỗi upload ảnh lên Cloudinary');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/');
      const isLt5MB = file.size / 1024 / 1024 < 5;
      console.log('File selected:', { file, isImage, isLt5MB });

      if (!isImage) {
        message.error('Vui lòng chỉ tải lên file hình ảnh!');
        return false;
      }
      if (!isLt5MB) {
        message.error('Hình ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      uploadImage(file);
      return false;
    },
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để gửi thông tin liên hệ!');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.mota) {
      message.error('Vui lòng điền đầy đủ tên, số điện thoại và mô tả');
      return;
    }

    if (!validatePhone(formData.phone)) {
      message.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số).');
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const submission = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      conversation: [{
        sender: 'client',
        content: formData.mota,
        image: formData.image,
        timestamp,
      }],
      status: false,
    };

    try {
      setConnectionError(false);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/contacts', submission, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Gửi thông tin thành công!');
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        mota: '',
        image: undefined,
      }));
      if (formData.email) {
        fetchContactsByEmail(formData.email);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error || 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!';
      message.error(errorMessage);
      console.error('Lỗi khi gửi thông tin:', {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      setConnectionError(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const email = checkAuth();
    if (email) {
      fetchContactsByEmail(email);
    } else {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: localStorage.getItem('token') },
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Kết nối với server Socket.IO:', socketInstance.id);
      setConnectionError(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Lỗi kết nối Socket.IO:', error);
      message.error('Không thể kết nối tới server Socket.IO. Vui lòng kiểm tra kết nối mạng!');
      setConnectionError(true);
    });

    socketInstance.on('contactCreated', (newContact: IContact) => {
      if (newContact.email === formData.email) {
        setContacts((prev) => [...prev, newContact].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
        message.info(`Liên hệ mới đã được tạo: ${newContact.name}`);
      }
    });

    socketInstance.on('contactUpdated', (updatedContact: IContact) => {
      if (updatedContact.email === formData.email) {
        setContacts((prev) => {
          const exists = prev.some((contact) => contact._id === updatedContact._id);
          const newContacts = exists
            ? prev.map((contact) => (contact._id === updatedContact._id ? updatedContact : contact))
            : [...prev, updatedContact];
          return newContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        message.info('Bạn đã nhận được phản hồi từ XPhone Store!');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Ngắt kết nối với server Socket.IO');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [formData.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Điền thông tin dưới đây để liên hệ.
          </p>
          {isAuthenticated ? (
            <div className="flex justify-center gap-4 mt-4">
              <p className="text-lg text-gray-700">Đăng nhập với: <strong>{formData.email}</strong></p>
              {/* <AntButton
                onClick={handleLogout}
                className="flex items-center gap-2"
                icon={<LogOut className="w-5 h-5" />}
              >
                Đăng xuất
              </AntButton> */}
            </div>
          ) : (
            <p className="text-lg text-red-500 mt-4">Vui lòng đăng nhập để sử dụng tính năng liên hệ.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">XPhone Store</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Hệ thống cửa hàng XPhone chuyên bán lẻ điện thoại, máy tính laptop, smartwatch, smartphone, phụ kiện chính
                hãng - Giá tốt, giao miễn phí.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                    <p className="text-gray-600">0123 456 789</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">trinhthiduong@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Hỗ trợ khách hàng</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Sản phẩm chính hãng</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gửi thông tin liên hệ</h3>
              </div>
              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại (VD: 0935123456)"
                    />
                  </div>
                  <div>
                    <label htmlFor="mota" className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      id="mota"
                      name="mota"
                      value={formData.mota}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập mô tả hoặc câu hỏi của bạn"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh (Tùy chọn)
                    </label>
                    <AntdUpload {...uploadProps}>
                      <Button icon={<UploadOutlined />} loading={uploading}>
                        Tải lên hình ảnh
                      </Button>
                    </AntdUpload>
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{ marginTop: 8, maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    disabled={uploading || connectionError}
                  >
                    Gửi thông tin
                  </button>
                </form>
              ) : (
                <p className="text-center text-red-500">Vui lòng đăng nhập để gửi thông tin liên hệ.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Lịch sử liên hệ</h3>
                <Button
                  type="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={connectionError || !isAuthenticated}
                >
                  Xem liên hệ
                </Button>
              </div>
              {connectionError && (
                <p className="text-center text-red-500 mb-4">Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng!</p>
              )}
              <Modal
                title="Lịch sử liên hệ"
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
                width={800}
              >
                {isAuthenticated && contacts.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {contacts.map((contact: IContact) => (
                      <div key={contact._id} className="border-b pb-4 mb-4">
                        {contact.conversation.length > 0 && (
                          <p className="text-sm text-gray-500 mb-2">
                            Liên hệ ngày {contact.conversation[0]?.timestamp || ''}
                          </p>
                        )}
                        <div className="space-y-4">
                          {contact.conversation.map((msg: IMessage, index: number) => (
                            <div
                              key={index}
                              className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] p-4 rounded-lg ${
                                  msg.sender === 'client' ? 'bg-blue-100' : 'bg-green-100'
                                }`}
                              >
                                <p className="font-semibold">{msg.sender === 'client' ? contact.name : 'Admin'}</p>
                                <p>{msg.content}</p>
                                {msg.image && (
                                  <img
                                    src={msg.image}
                                    alt="Message"
                                    className="mt-2 max-w-full h-auto"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  />
                                )}
                                <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    {isAuthenticated ? 'Chưa có lịch sử liên hệ.' : 'Vui lòng đăng nhập để xem lịch sử liên hệ.'}
                  </p>
                )}
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;