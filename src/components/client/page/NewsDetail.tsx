import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsApi } from '../../../api/newsApi';
import { INews } from '../../../interface/News';
import { toast } from 'react-toastify';

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<INews | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNewsDetail(id);
        } else {
            navigate('/news');
        }
    }, [id, navigate]);

    const fetchNewsDetail = async (newsId: string) => {
        try {
            const response = await newsApi.getById(newsId);
            if (response) {
                setNews(response);
            } else {
                toast.error('Không tìm thấy tin tức');
                navigate('/news');
            }
        } catch (error) {
            console.error('Failed to fetch news detail:', error);
            toast.error('Có lỗi xảy ra khi tải tin tức');
            navigate('/news');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy tin tức</h2>
                    <button
                        onClick={() => navigate('/news')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Quay lại danh sách tin tức
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-96 object-cover"
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image';
                        }}
                    />
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">{news.category}</span>
                            <span className="text-sm text-gray-500">{new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">{news.title}</h1>
                        <div className="flex items-center mb-6">
                            <span className="text-sm text-gray-500">Tác giả: {news.author}</span>
                        </div>
                        <div className="prose max-w-none">
                            <p className="text-gray-600 whitespace-pre-line">{news.content}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/news')}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Quay lại danh sách tin tức
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail; 