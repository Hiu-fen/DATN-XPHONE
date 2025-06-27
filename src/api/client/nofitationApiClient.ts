import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/notifications';

// Lấy danh sách thông báo user
export const getUserNotifications = (userId: string) => {
  return axios.get(`${BASE_URL}/user?userId=${userId}`);
};

// Tạo thông báo cho user
export const createNotificationForUser = (data: {
  userId: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}) => {
  return axios.post(`${BASE_URL}/user`, data);
};

// Đánh dấu 1 thông báo là đã đọc
export const markOneUserNotiAsRead = (id: string, userId: string) => {
  return axios.patch(`${BASE_URL}/user/${id}/read?userId=${userId}`);
};

// Đánh dấu tất cả đã đọc
export const markAllUserNotiAsRead = (userId: string) => {
  return axios.patch(`${BASE_URL}/user/read-all?userId=${userId}`);
};

// Xóa mềm 1 thông báo 
export const deleteUserNotification = (id: string, userId: string) => {
  return axios.delete(`${BASE_URL}/user/${id}?userId=${userId}`);
};

// Xóa mềm tất cả thông báo 
export const deleteAllUserNotifications = (userId: string) => {
  return axios.delete(`${BASE_URL}/user?userId=${userId}`);
};

// Hiển thị những thông báo chưa đọc
export const getUserUnreadCount = (userId: string) => {
  return axios.get(`${BASE_URL}/user/unread-count?userId=${userId}`);
};