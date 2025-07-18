import axios from 'axios';

// Địa chỉ gốc của API backend cho news
const BASE_URL = 'http://localhost:5000/api/news';


// ✅ Lấy tất cả tin tức có status = true (tin đã publish)
export const getPublishedNews = () => axios.get(`${BASE_URL}/published`);

// ✅ Lấy tin tức theo ID
export const getNewsById = (id: string) => axios.get(`${BASE_URL}/${id}`);

