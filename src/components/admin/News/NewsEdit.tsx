import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Upload,
  Spin,
  Tooltip,
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminNewsById, updateNews } from '../../../api/admin/newAdmin';
import { INews } from '../../../interface/News';
import axios from 'axios';
import { useState } from 'react';

const { TextArea } = Input;

const NewsEdit = () => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<INews>({
    defaultValues: {
      name: '',
      content: '',
      image: '',
      author: '',
      status: true,
    },
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [uploading, setUploading] = useState(false);
  const image = watch('image');

  // ✅ Fetch news data by ID
  const { isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) return;
      const { data } = await getAdminNewsById(id);
      reset(data);
      return data;
    },
    enabled: !!id,
  });

  // ✅ Update news mutation
  const mutation = useMutation({
    mutationFn: async (data: INews) => {
      return updateNews(id as string, data);
    },
    onSuccess: () => {
      message.success('Cập nhật tin tức thành công!');
      navigate('/admin/news/list');
    },
    onError: () => {
      message.error('Cập nhật tin tức thất bại!');
    },
  });

  // ✅ Upload image Cloudinary
  const uploadImage = async (file: File) => {
    const name = watch('name');
    if (!name) {
      message.warning('Vui lòng nhập tiêu đề trước khi tải ảnh');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    const publicId = `news_${name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
    const renamedFile = new File([file], publicId, { type: file.type });

    formData.append('file', renamedFile);
    formData.append('upload_preset', 'datn-xphone');

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload',
        formData
      );
      setValue('image', data.secure_url, { shouldValidate: true });
      message.success('Tải ảnh thành công');
    } catch (err) {
      console.error(err);
      message.error('Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: INews) => {
    mutation.mutate(data);
  };

  if (isLoading) return <Spin className="block mx-auto my-10" size="large" />;

  return (
      <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-4">Cập nhật tin tức</h2>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="bg-white shadow rounded border-2 p-6">
        {/* Tiêu đề */}
        <Form.Item
          label="Tiêu đề"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Vui lòng nhập tiêu đề' }}
            render={({ field }) => <Input {...field} placeholder="Nhập tiêu đề tin tức" />}
          />
        </Form.Item>

        {/* Nội dung */}
        <Form.Item
          label="Nội dung"
          validateStatus={errors.content ? 'error' : ''}
          help={errors.content?.message}
        >
          <Controller
            name="content"
            control={control}
            rules={{ required: 'Vui lòng nhập nội dung' }}
            render={({ field }) => (
              <TextArea {...field} rows={5} placeholder="Nhập nội dung tin tức" />
            )}
          />
        </Form.Item>

        {/* Hình ảnh */}
        <Form.Item
          label="Hình ảnh"
          validateStatus={errors.image ? 'error' : ''}
          help={errors.image?.message}
        >
          <Controller
            name="image"
            control={control}
            rules={{ required: 'Vui lòng tải ảnh' }}
            render={({ field }) => (
              <>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    uploadImage(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} disabled={uploading}>
                    {uploading ? <Spin size="small" /> : 'Chọn ảnh'}
                  </Button>
                </Upload>
                {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="mt-3 w-48 h-32 object-cover rounded border"
                  />
                )}
                <input type="hidden" {...field} />
              </>
            )}
          />
        </Form.Item>

        {/* Tác giả */}
        <Form.Item
          label="Tác giả"
          validateStatus={errors.author ? 'error' : ''}
          help={errors.author?.message}
        >
          <Controller
            name="author"
            control={control}
            rules={{ required: 'Vui lòng nhập tên tác giả' }}
            render={({ field }) => <Input {...field} placeholder="Nhập tên tác giả" />}
          />
        </Form.Item>

        {/* Trạng thái */}
        <Form.Item label="Trạng thái">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Chọn trạng thái">
                <Select.Option value={true}>Hiển thị</Select.Option>
                <Select.Option value={false}>Ẩn</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Cập nhật tin tức
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

export default NewsEdit;
