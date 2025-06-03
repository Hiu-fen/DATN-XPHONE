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
}

interface IProductForm {
  name: string;
  image: string;
  albumImages: string[];
  soluong: number;
  mota?: string;
  danhmuc: number;    // đổi sang số
  price: number;
  trangthai: string;
  variants: VariantInput[];
}

interface ICategory {
  _id: number;        // đổi sang số
  name: string;
}

const { TextArea } = Input;

const AddProduct: React.FC = () => {
  // Khởi tạo react-hook-form, set default values
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
      danhmuc: 0,       // giá trị mặc định
      price: 0,
      trangthai: "còn bán",
      variants: [],
    },
  });

  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);

  // useFieldArray để quản lý mảng variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Lấy dữ liệu categories khi component mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/category").then((res) => {
      // Giả sử res.data trả về mảng ICategory[] với _id là number
      setCategories(res.data);
    });
  }, []);

  // Lấy giá trị đang watch
  const image = watch("image");
  const albumImages = watch("albumImages");

  // Hàm upload ảnh chính
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

  // Hàm upload album images
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

  // Hàm xử lý submit form
  const onSubmit = async (data: IProductForm) => {
    try {
      // 1. Kiểm tra các trường bắt buộc
      const selectedCategory = categories.find((c) => c._id === data.danhmuc);
      if (!selectedCategory) {
        message.error("Không tìm thấy danh mục đã chọn");
        return;
      }
      if (!data.image) {
        message.error("Vui lòng chọn ảnh chính");
        return;
      }
      if (!data.albumImages.length) {
        message.error("Vui lòng chọn ít nhất một ảnh phụ");
        return;
      }

      // 2. Tạo payload gửi lên server
      const payload: IProductForm = {
        name: data.name,
        image: data.image,
        albumImages: data.albumImages,
        soluong: data.soluong,
        mota: data.mota,
        danhmuc: selectedCategory._id, // gửi số
        price: data.price,
        trangthai: data.trangthai,
        variants: data.variants,
      };

      // 3. Gọi API POST /api/products
      await axios.post("http://localhost:5000/api/products", payload);
      message.success("Thêm sản phẩm thành công");
      navigate("/admin/phone/list", { state: { forceReload: true } });

      // 4. Reset lại form
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

      {/* Ảnh phụ (albumImages) */}
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
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh phụ</Button>
        </Upload>
        {albumLoading && <Spin style={{ marginLeft: 10 }} />}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {watch("albumImages")?.map((url, idx) => (
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

      {/* Giá gốc */}
      <Form.Item
        label="Giá gốc"
        validateStatus={errors.price ? "error" : ""}
        help={errors.price?.message}
        required
      >
        <Controller
          name="price"
          control={control}
          rules={{ required: "Nhập giá gốc" }}
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
          rules={{ required: "Nhập trạng thái" }}
          render={({ field }) => <Input {...field} />}
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
          rules={{ required: "Nhập số lượng" }}
          render={({ field }) => <InputNumber<number> min={0} {...field} />}
        />
      </Form.Item>

      {/* Mô tả */}
      <Form.Item label="Mô tả">
        <Controller
          name="mota"
          control={control}
          render={({ field }) => <TextArea rows={3} {...field} />}
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

      {/* Mảng biến thể (variants) */}
      <Form.Item label="Biến thể">
        {variantFields.map((field, index) => (
          <Space key={field.id} align="baseline" style={{ marginBottom: 8 }}>
            <Controller
              name={`variants.${index}.color`}
              control={control}
              rules={{ required: "Nhập màu" }}
              render={({ field }) => <Input placeholder="Color" {...field} />}
            />
            <Controller
              name={`variants.${index}.ram`}
              control={control}
              rules={{ required: "Nhập RAM" }}
              render={({ field }) => <Input placeholder="RAM" {...field} />}
            />
            <Controller
              name={`variants.${index}.price`}
              control={control}
              rules={{ required: "Nhập giá biến thể" }}
              render={({ field }) => (
                <InputNumber<number>
                  min={0}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(val) => (val ? Number(val.replace(/,/g, "")) : 0)}
                  placeholder="Giá"
                  {...field}
                />
              )}
            />
            <MinusCircleOutlined onClick={() => removeVariant(index)} />
          </Space>
        ))}

        <Button
          type="dashed"
          onClick={() => appendVariant({ color: "", ram: "", price: 0 })}
          block
          icon={<PlusOutlined />}
        >
          Thêm biến thể
        </Button>
      </Form.Item>

      {/* Cuối cùng: nút submit */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm sản phẩm
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProduct;
