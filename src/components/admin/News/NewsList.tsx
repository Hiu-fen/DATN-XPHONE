import React, { useState, useEffect } from 'react';
import { Table, Button, message, Input, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { INews } from '../../../interface/News';

const NewsList: React.FC = () => {
    const [news, setNews] = useState<INews[]>([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchNews = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:5000/api/news');
            setNews(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách tin tức, vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id: string) => {
        if (deletingId === id) return;
        
        try {
            setDeletingId(id);
            const response = await axios.delete(`http://localhost:5000/api/news/${id}`);
            
            if (response.data.success) {
                setNews(prev => prev.filter(item => item._id !== id));
                message.success('Xóa tin tức thành công!');
            } else {
                message.error(response.data.message || 'Xóa tin tức thất bại!');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message || 'Xóa tin tức thất bại, vui lòng thử lại!');
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } finally {
            setDeletingId(null);
        }
    };

    const search = news?.filter((item: INews) => {
        const text = `${item.title} ${item.author} ${item.category} ${item.content}`.toLowerCase();
        return text.includes(searchText.toLowerCase());
    });

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_: any, __: INews, index: number) => index + 1,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: INews) => (
                <div className="flex items-center">
                    <img 
                        src={record.image} 
                        alt={text}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                        onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMjAgMTlDMTguMzQzMSAxOSAxNyAxNy42NTY5IDE3IDE2QzE3IDE0LjM0MzEgMTguMzQzMSAxMyAyMCAxM0MyMS42NTY5IDEzIDIzIDE0LjM0MzEgMjMgMTZDMjMgMTcuNjU2OSAyMS42NTY5IDE5IDIwIDE5Wk0yMCAyMUMyMi4yMSAyMSAyNCAyMi4zNDMxIDI0IDI0VjI1SDI0QzI0IDI1IDE2IDI1IDE2IDI0QzE2IDIyLjM0MzEgMTcuNzkgMjEgMjAgMjFaIiBmaWxsPSIjNjY2Ii8+PC9zdmc+';
                        }}
                    />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: INews) => (
                <span>
                    <Link to={`/news/${record._id}`}>
                        <Button type="link" icon={<EyeOutlined />} />
                    </Link>
                    <Link to={`/admin/news/edit/${record._id}`}>
                        <Button type="link" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title="Xóa tin tức"
                        description="Bạn có chắc chắn muốn xóa tin tức này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ 
                            danger: true,
                            loading: deletingId === record._id 
                        }}
                    >
                        <Button 
                            type="link" 
                            danger 
                            icon={<DeleteOutlined />}
                            loading={deletingId === record._id}
                        />
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Quản lý tin tức</h2>
                <div className="flex gap-4">
                    <Input.Search
                        placeholder="Tìm kiếm tin tức..."
                        className="w-64"
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Link to="/admin/news/add">
                        <Button type="primary">
                            Thêm tin tức mới
                        </Button>
                    </Link>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={search}
                rowKey="_id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    pageSizeOptions: ['5', '10', '20'],
                }}
            />
        </div>
    );
};

export default NewsList; 