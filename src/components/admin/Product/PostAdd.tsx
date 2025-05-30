import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { message, Form, Input, Select, Button, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { RcFile } from "antd/lib/upload";

interface IProduct {
  name: string;
  image: string;
  albumImages: string[];
  price: number;
  soluong: number;
  mota: string;
  danhmuc: string;
  trangthai: string;
}

interface ICategory {
  _id: string;
  name: string;
}

const { TextArea } = Input;

const AddProduct = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IProduct>({
    defaultValues: {
      image: "",
      albumImages: [],
    },
  });

  const nav = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/category").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const image = watch("image");
  const albumImages = watch("albumImages");

  const uploadImage = async (fileList: RcFile[]) => {
    if (!fileList || fileList.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileList[0]);
    formData.append("upload_preset", "datn-xphone");

    const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";
    try {
      const { data } = await axios.post(endPoint, formData);
      setValue("image", data.url, { shouldValidate: true });
      message.success("Tải ảnh chính thành công");
    } catch (error) {
      message.error("Lỗi upload ảnh chính");
      console.error("Lỗi upload ảnh chính:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAlbumImages = async (fileList: RcFile[]) => {
    if (!fileList || fileList.length === 0) return;
    setAlbumLoading(true);

    try {
      const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "datn-xphone");
        const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";
        const { data } = await axios.post(endPoint, formData);
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      const newAlbum = [...albumImages, ...urls];
      setValue("albumImages", newAlbum, { shouldValidate: true });
      message.success("Tải ảnh phụ thành công");
    } catch (error) {
      message.error("Lỗi upload ảnh phụ");
      console.error("Lỗi upload ảnh phụ:", error);
    } finally {
      setAlbumLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...albumImages];
    updated.splice(index, 1);
    setValue("albumImages", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: IProduct) => {
    try {
      const selectedCategory = categories.find((cat) => cat._id === data.danhmuc);
      if (!selectedCategory) {
        message.error("Không tìm thấy danh mục đã chọn");
        return;
      }

      if (!data.image) {
        message.error("Ảnh chính không được để trống");
        return;
      }

      if (!data.albumImages || data.albumImages.length === 0) {
        message.error("Ảnh phụ không được để trống");
        return;
      }

      const productData = {
        ...data,
        danhmuc: selectedCategory.name,
      };

      await axios.post("http://localhost:5000/api/products", productData);
      message.success("Thêm mới thành công");
      nav("/admin/phone/list", { state: { forceReload: true } });
      reset({
        image: "",
        albumImages: [],
      });
    } catch (error) {
      message.error("Có lỗi khi thêm sản phẩm");
      console.error(error);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-6 bg-white rounded shadow-md"
    >
      <h2 className="text-xl font-semibold text-center mb-4">Thêm sản phẩm</h2>

      {/* Tên sản phẩm */}
      <Form.Item
        label="Tên sản phẩm"
        validateStatus={errors.name ? "error" : ""}
        help={errors.name?.message}
        required
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: "Vui lòng nhập tên sản phẩm" }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      {/* Ảnh chính */}
      <Form.Item
        label="Hình ảnh chính"
        required
        validateStatus={errors.image ? "error" : ""}
        help={errors.image?.message}
      >
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            uploadImage([file]);
            return false; // prevent auto upload
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {loading && <Spin style={{ marginLeft: 10 }} />}
        {image && (
          <img
            src={image}
            alt="Ảnh chính"
            style={{ marginTop: 8, maxWidth: 150, maxHeight: 150, borderRadius: 6 }}
          />
        )}
      </Form.Item>

      {/* Ảnh phụ */}
      <Form.Item
        label="Hình ảnh phụ"
        required
        validateStatus={errors.albumImages ? "error" : ""}
        help={errors.albumImages?.message}
      >
        <Upload
          accept="image/*"
          multiple
          showUploadList={false}
          beforeUpload={(fileList) => {
            uploadAlbumImages(Array.isArray(fileList) ? fileList : [fileList]);
            return false; // prevent auto upload
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh phụ</Button>
        </Upload>
        {albumLoading && <Spin style={{ marginLeft: 10 }} />}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {albumImages?.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={img}
                alt={`Ảnh phụ ${index + 1}`}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
              />
              <Button
                type="primary"
                danger
                size="small"
                style={{ position: "absolute", top: 0, right: 0, padding: "0 6px" }}
                onClick={() => removeImage(index)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </Form.Item>

      {/* Giá */}
      <Form.Item
        label="Giá"
        validateStatus={errors.price ? "error" : ""}
        help={errors.price?.message}
        required
      >
        <Controller
          name="price"
          control={control}
          rules={{
            required: "Vui lòng nhập giá",
            min: { value: 1, message: "Giá phải lớn hơn 0" },
          }}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </Form.Item>

      {/* Số lượng */}
      <Form.Item
        label="Số lượng"
        validateStatus={errors.soluong ? "error" : ""}
        help={errors.soluong?.message}
        required
      >
        <Controller
          name="soluong"
          control={control}
          rules={{
            required: "Vui lòng nhập số lượng",
            min: { value: 1, message: "Số lượng phải lớn hơn 0" },
          }}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </Form.Item>

      {/* Mô tả */}
      <Form.Item label="Mô tả">
        <Controller
          name="mota"
          control={control}
          render={({ field }) => <TextArea rows={4} {...field} />}
        />
      </Form.Item>

      {/* Danh mục */}
      <Form.Item
        label="Danh mục"
        validateStatus={errors.danhmuc ? "error" : ""}
        help={errors.danhmuc?.message}
        required
      >
        <Controller
          name="danhmuc"
          control={control}
          rules={{ required: "Vui lòng chọn danh mục" }}
          render={({ field }) => (
            <Select
              placeholder="Chọn danh mục"
              onChange={field.onChange}
              value={field.value}
              options={categories.map((cat) => ({ label: cat.name, value: cat._id }))}
            />
          )}
        />
      </Form.Item>

      {/* Trạng thái */}
      <Form.Item
        label="Trạng thái"
        validateStatus={errors.trangthai ? "error" : ""}
        help={errors.trangthai?.message}
        required
      >
        <Controller
          name="trangthai"
          control={control}
          rules={{ required: "Vui lòng chọn trạng thái" }}
          render={({ field }) => (
            <Select
              placeholder="Chọn trạng thái"
              onChange={field.onChange}
              value={field.value}
              options={[
                { label: "Còn hàng", value: "còn hàng" },
                { label: "Hết hàng", value: "hết hàng" },
              ]}
            />
          )}
        />
      </Form.Item>

      {/* Nút submit */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading || albumLoading}>
          Thêm sản phẩm
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProduct;
