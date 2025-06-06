import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
import {
  message,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Spin,
  Space,
  InputNumber,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { RcFile } from "antd/lib/upload";

interface VariantInput {
  color: string;
  ram: string;
  price: number;
  soluong: number; // Số lượng cho từng biến thể
}

interface IProductForm {
  name: string;
  image: string;
  albumImages: string[];
  soluong: number;       // Tổng số lượng (auto-disabled, tính từ biến thể)
  mota?: string;         // Không bắt buộc
  danhmuc: number;
  price: number;
  trangthai: string;
  variants: VariantInput[];
}

interface ICategory {
  _id: number;
  name: string;
}

const { TextArea } = Input;

const AddProduct: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IProductForm>({
    defaultValues: {
      name: "",
      image: "",
      albumImages: [],
      soluong: 0,
      mota: "",
      danhmuc: 0,
      price: 0,
      trangthai: "còn bán",
      variants: [],
    },
  });

  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);

  // Quản lý mảng variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Lấy danh sách category khi component mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/category").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const image = watch("image");
  const albumImages = watch("albumImages");
  const watchedVariants = watch("variants") || [];

  // Tự động tính tổng soluong từ mảng variants
  useEffect(() => {
    const total = watchedVariants.reduce((sum, v) => sum + (v.soluong || 0), 0);
    setValue("soluong", total);
  }, [watchedVariants, setValue]);

  // Upload ảnh chính
  const uploadImage = async (fileList: RcFile[]) => {
    if (!fileList.length) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileList[0]);
    formData.append("upload_preset", "datn-xphone");

    try {
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload",
        formData
      );
      setValue("image", data.url, { shouldValidate: true });
      message.success("Tải ảnh chính thành công");
    } catch (err) {
      message.error("Lỗi upload ảnh chính");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh phụ (album)
  const uploadAlbumImages = async (fileList: RcFile[]) => {
    if (!fileList.length) return;
    setAlbumLoading(true);
    try {
      const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "datn-xphone");
        const { data } = await axios.post(
          "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload",
          formData
        );
        return data.url;
      });
      const urls = await Promise.all(uploadPromises);
      const newAlbum = [...albumImages, ...urls];
      setValue("albumImages", newAlbum, { shouldValidate: true });
      message.success("Tải ảnh phụ thành công");
    } catch (err) {
      message.error("Lỗi upload ảnh phụ");
      console.error(err);
    } finally {
      setAlbumLoading(false);
    }
  };

  // Xóa 1 ảnh trong album
  const removeImage = (index: number) => {
    const updated = [...albumImages];
    updated.splice(index, 1);
    setValue("albumImages", updated, { shouldValidate: true });
  };

  // Xử lý submit form
  const onSubmit = async (data: IProductForm) => {
    try {
      // 1. Kiểm tra category đã chọn
      const selectedCategory = categories.find((c) => c._id === data.danhmuc);
      if (!selectedCategory) {
        message.error("Không tìm thấy danh mục đã chọn");
        return;
      }
      // 2. Kiểm tra ảnh chính
      if (!data.image) {
        message.error("Vui lòng chọn ảnh chính");
        return;
      }
      // 3. Kiểm tra ảnh phụ
      if (!data.albumImages.length) {
        message.error("Vui lòng chọn ít nhất một ảnh phụ");
        return;
      }
      // 4. Kiểm tra biến thể: mỗi biến thể phải có color, ram, price và soluong
      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        if (!v.color) {
          message.error(`Biến thể thứ ${i + 1} thiếu Màu`);
          return;
        }
        if (!v.ram) {
          message.error(`Biến thể thứ ${i + 1} thiếu RAM`);
          return;
        }
        if (v.price == null) {
          message.error(`Biến thể thứ ${i + 1} thiếu Giá`);
          return;
        }
        if (v.soluong == null) {
          message.error(`Biến thể thứ ${i + 1} thiếu Số lượng`);
          return;
        }
      }

      // 5. Tạo payload gửi lên server
      const payload: IProductForm = {
        name: data.name,
        image: data.image,
        albumImages: data.albumImages,
        soluong: data.soluong,
        mota: data.mota,
        danhmuc: selectedCategory._id,
        price: data.price,
        trangthai: data.trangthai,
        variants: data.variants,
      };

      await axios.post("http://localhost:5000/api/products", payload);
      message.success("Thêm sản phẩm thành công");
      navigate("/admin/phone/list", { state: { forceReload: true } });

      // 6. Reset lại form
      reset({
        name: "",
        image: "",
        albumImages: [],
        soluong: 0,
        mota: "",
        danhmuc: 0,
        price: 0,
        trangthai: "còn bán",
        variants: [],
      });
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      message.error("Thêm sản phẩm thất bại");
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold text-center mb-4">Thêm sản phẩm</h2>

      {/* Tên sản phẩm (required) */}
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

      {/* Ảnh chính (required) */}
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
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {loading && <Spin style={{ marginLeft: 10 }} />}
        {image && (
          <img
            src={image}
            alt="Ảnh chính"
            style={{
              marginTop: 8,
              maxWidth: 150,
              maxHeight: 150,
              borderRadius: 6,
            }}
          />
        )}
      </Form.Item>

      {/* Ảnh phụ (albumImages) (required) */}
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
            uploadAlbumImages(
              Array.isArray(fileList) ? fileList : [fileList]
            );
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh phụ</Button>
        </Upload>
        {albumLoading && <Spin style={{ marginLeft: 10 }} />}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {albumImages.map((url, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={url}
                alt={`Ảnh phụ ${idx + 1}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <Button
                type="primary"
                danger
                size="small"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  padding: "0 6px",
                }}
                onClick={() => removeImage(idx)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </Form.Item>

      {/* Giá gốc (required) */}
      <Form.Item
        label="Giá gốc"
        validateStatus={errors.price ? "error" : ""}
        help={errors.price?.message}
        required
      >
        <Controller
          name="price"
          control={control}
          rules={{
            required: "Nhập giá gốc",
            min: { value: 1, message: "Giá phải lớn hơn 0" },
          }}
          render={({ field }) => (
            <InputNumber<number>
              min={0}
              style={{ width: "100%" }}
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(val) => (val ? Number(val.replace(/,/g, "")) : 0)}
              {...field}
            />
          )}
        />
      </Form.Item>

      {/* Trạng thái (required) */}
      <Form.Item
        label="Trạng thái"
        validateStatus={errors.trangthai ? "error" : ""}
        help={errors.trangthai?.message}
        required
      >
        <Controller
          name="trangthai"
          control={control}
          rules={{ required: "Nhập trạng thái" }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      {/* Số lượng tổng (auto-calculated, read-only) */}
      <Form.Item
        label="Số lượng tổng"
        validateStatus={errors.soluong ? "error" : ""}
        help={errors.soluong?.message}
        required
      >
        <Controller
          name="soluong"
          control={control}
          rules={{
            required: "Số lượng tổng phải có giá trị (tính từ biến thể)",
          }}
          render={({ field }) => (
            <InputNumber<number>
              {...field}
              min={0}
              style={{ width: "100%" }}
              disabled
            />
          )}
        />
      </Form.Item>

      {/* Mô tả (không required) */}
      <Form.Item label="Mô tả">
        <Controller
          name="mota"
          control={control}
          render={({ field }) => <TextArea rows={3} {...field} />}
        />
      </Form.Item>

      {/* Danh mục (required) */}
      <Form.Item
        label="Danh mục"
        validateStatus={errors.danhmuc ? "error" : ""}
        help={errors.danhmuc?.message}
        required
      >
        <Controller
          name="danhmuc"
          control={control}
          rules={{ required: "Chọn danh mục" }}
          render={({ field }) => (
            <Select {...field} placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      {/* Mảng biến thể (variants). Mỗi trường color, ram, price, soluong đều required */}
      <Form.Item label="Biến thể (Màu; RAM; Số lượng; Giá)">
        {variantFields.map((field, index) => (
          <Space
            key={field.id}
            align="baseline"
            style={{ marginBottom: 8, display: "flex", width: "100%", flexWrap: "wrap" }}
          >
            {/* Ô nhập màu sắc (required) */}
            <Controller
              name={`variants.${index}.color`}
              control={control}
              rules={{ required: "Nhập màu sắc" }}
              render={({ field }) => (
                <Input
                  placeholder="Màu sắc"
                  {...field}
                  style={{ width: 150 }}
                />
              )}
            />

            {/* Ô nhập RAM (required) */}
            <Controller
              name={`variants.${index}.ram`}
              control={control}
              rules={{ required: "Nhập RAM" }}
              render={({ field }) => (
                <Input placeholder="RAM" {...field} style={{ width: 100 }} />
              )}
            />

            {/* Ô nhập số lượng biến thể (required) */}
            <Controller
              name={`variants.${index}.soluong`}
              control={control}
              rules={{ required: "Nhập số lượng biến thể" }}
              render={({ field }) => (
                <InputNumber<number>
                  min={0}
                  placeholder="Số lượng"
                  style={{ width: 120 }}
                  {...field}
                />
              )}
            />

            {/* Ô nhập giá biến thể (required) */}
            <Controller
              name={`variants.${index}.price`}
              control={control}
              rules={{ required: "Nhập giá biến thể" }}
              render={({ field }) => (
                <InputNumber<number>
                  min={0}
                  placeholder="Giá"
                  style={{ width: 120 }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(val) => (val ? Number(val.replace(/,/g, "")) : 0)}
                  {...field}
                />
              )}
            />

            {/* Nút xóa biến thể */}
            <MinusCircleOutlined onClick={() => removeVariant(index)} />
          </Space>
        ))}

        <Button
          type="dashed"
          onClick={() => appendVariant({ color: "", ram: "", soluong: 0, price: 0 })}
          block
          icon={<PlusOutlined />}
        >
          Thêm biến thể
        </Button>
      </Form.Item>

      {/* Nút submit */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm sản phẩm
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProduct;
