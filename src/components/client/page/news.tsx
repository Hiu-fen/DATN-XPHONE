import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../../../api/newsApi';
import { INews } from '../../../interface/News';

const NewsClient = () => {
    const [news, setNews] = useState<INews[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const data = await newsApi.getAll();
            // Sắp xếp tin tức theo thời gian tạo mới nhất
            const sortedNews = data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNews(sortedNews);
        } catch (error) {
            console.error('Failed to fetch news:', error);
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Tin Tức</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                                {index < 2 && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                                            HOT
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-500">{item.category}</span>
                                    <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <h2 className="text-xl font-semibold mb-3 text-gray-800 hover:text-blue-600 transition-colors duration-300">
                                    {item.title}
                                </h2>
                                <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">Tác giả: {item.author}</span>
                                    <Link 
                                        to={`/news/${item._id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
                                    >
                                        Đọc thêm
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsClient;