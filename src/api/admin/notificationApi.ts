import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/notifications';

// ✅ Lấy danh sách thông báo (có lọc theo userId và role)
export const getNotifications = (userId: string, role: string) => {
  return axios.get(`${BASE_URL}?userId=${userId}&role=${role}`);
};

// ✅ Tạo thông báo mới
export const createNotification = (data: {
  userId: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}) => {
  return axios.post(BASE_URL, data);
};

// ✅ Đánh dấu 1 thông báo là đã đọc (thêm userId)
export const markOneAsRead = (id: string, userId: string) => {
  return axios.patch(`${BASE_URL}/${id}/read?userId=${userId}`);
};

// ✅ Đánh dấu tất cả đã đọc
export const markAllAsRead = (userId: string, role: string) => {
  return axios.patch(`${BASE_URL}/read-all?userId=${userId}&role=${role}`);
};

// ✅ Xóa mềm 1 thông báo 
export const deleteNotification = (id: string, userId: string) => {
  return axios.delete(`${BASE_URL}/${id}?userId=${userId}`);
};

// ✅ Xóa mềm tất cả thông báo
export const deleteAllNotifications = (userId: string, role: string) => {
  return axios.delete(`${BASE_URL}?userId=${userId}&role=${role}`);
};