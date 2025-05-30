import React, { useState } from 'react';
import { ICategory } from '../../../interface/category';
import { message, Form, Input, Button, Upload, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

const PostAddCategory = () => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ICategory>();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const image = watch("image");

  const mutation = useMutation({
    mutationFn: async (data: ICategory) => {
      try {
        const { data: category } = await axios.post(`http://localhost:5000/api/category`, data);
        return category;
      } catch (error) {
        console.log(error);
        message.error("Thêm thất bại");
      }
    },
    onSuccess: () => {
      message.success("Thêm mới thành công");
      nav('/admin/category/list');
    }
  });

  const onSubmit = (data: ICategory) => {
    mutation.mutate(data);
  };

  const upLoadImage = async (fileList: File[]) => {
    const name = watch("name");
    if (!fileList || fileList.length === 0 || !name) {
      message.warning("Vui lòng nhập tên danh mục trước khi tải ảnh");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    const publicId = `category_${name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;

    // Đặt tên file upload giống public_id
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
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm mới danh mục</h2>
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
              return false; // ngăn tự động upload của Antd
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
  Thêm mới
</Button>

</Form.Item>

      </Form>
    </div>
  );
};

export default PostAddCategory;