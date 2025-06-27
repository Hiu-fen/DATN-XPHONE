import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/notifications';

// Lấy danh sách thông báo admin
export const getAdminNotifications = (userId: string) => {
  return axios.get(`${BASE_URL}/admin?userId=${userId}`);
};

// Tạo thông báo cho admin
export const createNotificationForAdmin = (data: {
  userId: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}) => {
  return axios.post(`${BASE_URL}/admin`, data);
};

// Đánh dấu 1 thông báo là đã đọc 
export const markOneAdminNotiAsRead = (id: string, userId: string) => {
  return axios.patch(`${BASE_URL}/admin/${id}/read?userId=${userId}`);
};

// Đánh dấu tất cả đã đọc 
export const markAllAdminNotiAsRead = (userId: string) => {
  return axios.patch(`${BASE_URL}/admin/read-all?userId=${userId}`);
};

// Xóa mềm 1 thông báo 
export const deleteAdminNotification = (id: string, userId: string) => {
  return axios.delete(`${BASE_URL}/admin/${id}?userId=${userId}`);
};

// Xóa mềm tất cả thông báo 
export const deleteAllAdminNotifications = (userId: string) => {
  return axios.delete(`${BASE_URL}/admin?userId=${userId}`);
};

// Hiển thị những thông báo chưa đọc
export const getAdminUnreadCount = (userId: string) => {
  return axios.get(`${BASE_URL}/admin/unread-count?userId=${userId}`);
};

// Lấy tất cả thông báo (dành cho admin quản lý toàn bộ)
export const getAllNotifications = () => {
  return axios.get(`${BASE_URL}/all`);
};

// Xoá 1 thông báo
export const deleteAdminNotificationChung = (id: string, userId: string) => {
  return axios.delete(`${BASE_URL}/${id}?userId=${userId}`);
};

// Dọn dẹp thông báo đã đọc + đã xoá
export const purgeReadAndDeletedNotifications = () => {
  return axios.delete(`${BASE_URL}/purge-read-deleted`);
};

