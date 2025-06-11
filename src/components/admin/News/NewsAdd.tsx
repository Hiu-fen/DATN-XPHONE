import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { message, Form, Input, Select, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { INews } from '../../../interface/News';

const { TextArea } = Input;

const categories = [
    { value: 'iPhone', label: 'iPhone' },
    { value: 'Samsung', label: 'Samsung' },
    { value: 'Xiaomi', label: 'Xiaomi' },
    { value: 'Oppo', label: 'Oppo' },
    { value: 'Vivo', label: 'Vivo' },
    { value: 'Realme', label: 'Realme' },
    { value: 'Phụ kiện', label: 'Phụ kiện' },
  
];

const NewsAdd = () => {
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<Omit<INews, '_id' | 'createdAt' | 'updatedAt'>>();

    const mutation = useMutation({
        mutationFn: async (data: Omit<INews, '_id' | 'createdAt' | 'updatedAt'>) => {
            const response = await axios.post('http://localhost:5000/api/news', {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return response.data;
        },
        onSuccess: () => {
            message.success('Thêm tin tức thành công');
            navigate('/admin/news/list');
        },
        onError: (error) => {
            console.error('Error adding news:', error);
            message.error('Thêm tin tức thất bại, vui lòng thử lại!');
        },
    });

    const onSubmit = (data: Omit<INews, '_id' | 'createdAt' | 'updatedAt'>) => {
        mutation.mutate(data);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thêm tin tức mới</h2>
                <Button 
                    type="text" 
                    onClick={() => navigate('/admin/news/list')}
                    icon={<span className="text-xl">×</span>}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Vui lòng nhập tiêu đề' }}
                        render={({ field }) => (
                            <Input {...field} placeholder="Nhập tiêu đề tin tức" />
                        )}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                    <Controller
                        name="content"
                        control={control}
                        rules={{ required: 'Vui lòng nhập nội dung' }}
                        render={({ field }) => (
                            <TextArea {...field} rows={6} placeholder="Nhập nội dung tin tức" />
                        )}
                    />
                    {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                    <Controller
                        name="image"
                        control={control}
                        rules={{ required: 'Vui lòng nhập URL hình ảnh' }}
                        render={({ field }) => (
                            <Input {...field} placeholder="Nhập URL hình ảnh" />
                        )}
                    />
                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                    <Controller
                        name="author"
                        control={control}
                        rules={{ required: 'Vui lòng nhập tên tác giả' }}
                        render={({ field }) => (
                            <Input {...field} placeholder="Nhập tên tác giả" />
                        )}
                    />
                    {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Vui lòng chọn danh mục' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                placeholder="Chọn danh mục"
                                className="w-full"
                                options={categories}
                                showSearch
                                optionFilterProp="label"
                            />
                        )}
                    />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <Controller
                        name="status"
                        control={control}
                        defaultValue="draft"
                        render={({ field }) => (
                            <Select
                                {...field}
                                className="w-full"
                            >
                                <Select.Option value="draft">Bản nháp</Select.Option>
                                <Select.Option value="published">Đã đăng</Select.Option>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Button onClick={() => navigate('/admin/news/list')}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                        Thêm tin tức
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewsAdd;