import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { newsApi } from '../../../api/newsApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import type { RcFile } from 'antd/es/upload/interface';

interface NewsFormData {
    title: string;
    content: string;
    image: string;
    author: string;
    status: 'published' | 'draft';
    category: string;
}

const NewsEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<NewsFormData>({
        title: '',
        content: '',
        image: '',
        author: '',
        status: 'draft',
        category: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsApi.getById(id!);
                setFormData({
                    title: response.title,
                    content: response.content,
                    image: response.image,
                    author: response.author,
                    status: response.status,
                    category: response.category
                });
            } catch (error) {
                toast.error('Không thể tải thông tin tin tức');
                navigate('/admin/news/list');
            }
        };

        fetchNews();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await newsApi.update(id!, formData);
            toast.success('Cập nhật tin tức thành công');
            navigate('/admin/news/list');
        } catch (error) {
            toast.error('Cập nhật tin tức thất bại');
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("upload_preset", "datn-xphone");

        try {
            const { data } = await axios.post(
                "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload",
                uploadFormData
            );
            setFormData({ ...formData, image: data.url });
            toast.success("Tải ảnh lên thành công!");
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error("Lỗi upload ảnh!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto mt-10 p-6 bg-white shadow rounded border-2">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa tin tức</h1>
                    <button
                        onClick={() => navigate('/admin/news/list')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={uploading}
                            />
                            {uploading && <p className="text-blue-500 text-sm mt-1">Đang tải ảnh lên...</p>}
                            {formData.image && (
                                <img src={formData.image} alt="Preview" className="mt-2 h-24 object-contain rounded" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({...formData, author: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as 'published' | 'draft'})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Bản nháp</option>
                                <option value="published">Đã đăng</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/news/list')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cập nhật tin tức
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsEdit;