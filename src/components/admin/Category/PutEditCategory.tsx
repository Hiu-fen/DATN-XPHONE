import React, { useState, useEffect } from 'react';
import { ICategory } from '../../../interface/category';
import { message, Form, Input, Button, Upload, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

const PutEditCategory = () => {
  const { register, control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ICategory>()
  const nav = useNavigate()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const image = watch('image')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['category', params.id],
    queryFn: async () => {
      const { data: category } = await axios.get(`http://localhost:5000/api/category/${params.id}`)
      return category
    }
  })

  // Khi data thay đổi (load thành công) thì reset form
  useEffect(() => {
    if (data) {
      reset(data)
    }
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: async (data: ICategory) => {
      try {
        const { data: updatedCategory } = await axios.put(`http://localhost:5000/api/category/${params.id}`, data)
        return updatedCategory
      } catch (error) {
        console.log(error)
        message.error("Lỗi khi cập nhật danh mục")
      }
    },
    onSuccess: () => {
      message.success("Sửa thành công")
      nav('/admin/category/list')
    }
  })

  const onSubmit = (data: ICategory) => {
    mutation.mutate(data);
  };

  // upload ảnh lên cloudinary
  const upLoadImage = async (fileList: File[]) => {
    if (!fileList || fileList.length === 0) return;
    setLoading(true);
    const formData = new FormData();

    const name = watch("name") || 'category';
    const publicId = `category_${name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;

    const renamedFile = new File([fileList[0]], publicId, { type: fileList[0].type });
    formData.append("file", renamedFile);
    formData.append("upload_preset", "datn-xphone");

    const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";

    try {
      const { data } = await axios.post(endPoint, formData);
      setValue("image", data.secure_url, { shouldValidate: true });
      message.success("Tải ảnh thành công");
    } catch (error) {
      console.error(error);
      message.error("Lỗi upload ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow rounded border-2">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Cập nhật danh mục</h2>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Tên danh mục"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } }}
            render={({ field }) => <Input placeholder="Nhập tên" {...field} />}
          />
        </Form.Item>

        <Form.Item
          label="Ảnh danh mục"
          required
          validateStatus={errors.image ? "error" : ""}
          help={errors.image?.message}
        >
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={file => {
              upLoadImage([file]);
              return false; // chặn tự động upload của Antd
            }}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
          {loading && <Spin style={{ marginLeft: 10 }} />}
          {image && (
            <img
              src={image}
              alt="Ảnh danh mục"
              style={{ marginTop: 8, maxWidth: 150, maxHeight: 150, borderRadius: 6 }}
            />
          )}
        </Form.Item>

        <Form.Item
          label="Mô tả"
          validateStatus={errors.mota ? "error" : ""}
          help={errors.mota?.message}
          required
        >
          <Controller
            name="mota"
            control={control}
            rules={{ required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } }}
            render={({ field }) => <Input placeholder="Nhập mô tả" {...field} />}
          />
        </Form.Item>

        {/* Hidden input để validate ảnh */}
        <Controller
          name="image"
          control={control}
          rules={{ required: "Ảnh không được để trống" }}
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutation.status === 'pending'}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PutEditCategory;
