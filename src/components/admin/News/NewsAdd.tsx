import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
    message, Form, Input, Select, Button, Upload, Spin,
    Tooltip
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { INews } from '../../../interface/News';
import { addNews } from '../../../api/admin/newAdmin';
import { useState } from 'react';

const { TextArea } = Input;

const NewsAdd = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<INews>({
        mode: 'onChange',
        defaultValues: {
            status: true,
        },
    });

    const name = watch('name'); // Lấy tiêu đề để đặt public_id ảnh

    const mutation = useMutation({
        mutationFn: async (data: INews) => {
            const payload = {
                name: data.name,
                content: data.content,
                image: data.image,
                author: data.author,
                status: data.status,
            };
            return addNews(payload);
        },
        onSuccess: () => {
            message.success('🎉 Thêm tin tức thành công!');
            navigate('/admin/news/list');
        },
        onError: () => {
            message.error('❌ Thêm tin tức thất bại!');
        },
    });

    // ✅ Upload ảnh Cloudinary
    const handleUpload = async (file: File, onChange: (url: string) => void) => {
        if (!name.trim()) {
            message.warning('Vui lòng nhập tiêu đề trước khi tải ảnh!');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        const publicId = `news_${name.trim().toLowerCase().replace(/\s+/g, '_')}`;
        const renamedFile = new File([file], publicId, { type: file.type });
        formData.append('file', renamedFile);
        formData.append('upload_preset', 'datn-xphone');

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                onChange(data.secure_url); // ✅ Gán URL vào field
                message.success('Tải ảnh thành công!');
            } else {
                throw new Error('Không lấy được URL ảnh');
            }
        } catch (err) {
            console.error(err);
            message.error('Lỗi tải ảnh!');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = (data: INews) => {
        mutation.mutate(data);
    };

    return (
        <div className="p-5 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4">Thêm mới tin tức</h2>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="bg-white shadow rounded border-2 p-6">
                {/* Tiêu đề */}
                <Controller
                    name="name"
                    control={control}
                    rules={{
                        required: 'Vui lòng nhập tiêu đề',
                        minLength: {
                            value: 9,
                            message: 'Tiêu đề phải có ít nhất 9 ký tự',
                        },
                    }}
                    render={({ field }) => (
                        <Form.Item
                            label="Tiêu đề"
                            validateStatus={errors.name ? 'error' : ''}
                            help={errors.name?.message}
                            required
                        >
                            <Input {...field} placeholder="Nhập tiêu đề tin tức" />
                        </Form.Item>
                    )}
                />

                {/* Nội dung */}
                <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Vui lòng nhập nội dung' }}
                    render={({ field }) => (
                        <Form.Item
                            label="Nội dung"
                            validateStatus={errors.content ? 'error' : ''}
                            help={errors.content?.message}
                            required
                        >
                            <TextArea {...field} rows={5} placeholder="Nhập nội dung tin tức" />
                        </Form.Item>
                    )}
                />

                {/* Hình ảnh */}
                <Controller
                    name="image"
                    control={control}
                    rules={{ required: 'Vui lòng tải lên hình ảnh' }}
                    render={({ field }) => (
                        <Form.Item
                            label="Hình ảnh"
                            validateStatus={errors.image ? 'error' : ''}
                            help={errors.image?.message}
                            required
                        >
                            <>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        handleUpload(file, field.onChange); 
                                        return false;
                                    }}
                                >
                                    <Button icon={<UploadOutlined />} disabled={uploading}>
                                        {uploading ? <Spin size="small" /> : 'Chọn ảnh'}
                                    </Button>
                                </Upload>
                                {field.value && (
                                    <img
                                        src={field.value}
                                        alt="preview"
                                        className="mt-3 w-48 h-32 object-cover rounded border"
                                    />
                                )}
                            </>
                        </Form.Item>
                    )}
                />

                {/* Tác giả */}
                <Controller
                    name="author"
                    control={control}
                    rules={{ required: 'Vui lòng nhập tên tác giả' }}
                    render={({ field }) => (
                        <Form.Item
                            label="Tác giả"
                            validateStatus={errors.author ? 'error' : ''}
                            help={errors.author?.message}
                            required
                        >
                            <Input {...field} placeholder="Nhập tên tác giả" />
                        </Form.Item>
                    )}
                />

                {/* Trạng thái */}
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Form.Item label="Trạng thái" required>
                            <Select {...field} placeholder="Chọn trạng thái">
                                <Select.Option value={true}>Hiển thị</Select.Option>
                                <Select.Option value={false}>Ẩn</Select.Option>
                            </Select>
                        </Form.Item>
                    )}
                />

                {/* Submit */}
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Thêm mới tin tức
                    </Button>
                </Form.Item>

                <div className="flex justify-end mt-2">
                    <Tooltip title="Quay lại">
                        <Button
                        type="default"
                        shape="circle"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        />
                    </Tooltip>
                </div>
            </Form>
        </div>
    );
};

export default NewsAdd;
