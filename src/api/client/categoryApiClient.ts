import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/category'

// Lấy tất cả danh mục
export const getAllCategories = () => axios.get(BASE_URL)

