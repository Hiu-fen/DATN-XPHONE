import axios from 'axios';

// Địa chỉ gốc của API backend cho news
const BASE_URL = 'http://localhost:5000/api/news';

// ✅ Lấy tất cả tin tức
export const getAllNews = () => axios.get(BASE_URL);

// ✅ Lấy tin tức theo ID (dành cho admin)
export const getAdminNewsById = (id: string) => axios.get(`${BASE_URL}/admin/${id}`);

// ✅ Lấy danh sách người xem tin tức
export const getNewsViewers = (id: string) =>
  axios.get(`/api/news/admin/${id}/viewers`);

// ✅ Thêm tin tức mới
export const addNews = (data: any) => axios.post(BASE_URL, data);

// ✅ Cập nhật tin tức
export const updateNews = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);

// ✅ Xoá tin tức
export const deleteNews = (id: string) => axios.delete(`${BASE_URL}/${id}`);

// ✅ Cập nhật trạng thái publish (bật/tắt hiển thị)
export const updateNewsStatus = (id: string, status: boolean) => {
  return axios.patch(`${BASE_URL}/status/${id}`, { status });
};
