import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
import {
  message,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Spin,
  Space,
  InputNumber,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import type { RcFile } from "antd/lib/upload";
import { IColor, IRam } from "../../../interface/variant";

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
  price: number;
  soluong: number;       // Tổng số lượng (auto tính từ biến thể)
  mota: string;
  danhmuc: string;       // name of category
  trangthai: string;
  variants: VariantInput[];
}

interface ICategory {
  _id: string;
  name: string;
}

const { TextArea } = Input;

const PutEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IProductForm>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      image: "",
      albumImages: [],
      price: 0,
      soluong: 0,
      mota: "",
      danhmuc: "",
      trangthai: "còn bán",
      variants: [],
    },
  });

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);

  const image = watch("image");
  const albumImages = watch("albumImages");
  const watchedVariants = watch("variants") || [];
  const [colors, setColors] = useState<IColor[]>([]);
  const [rams, setRams] = useState<IRam[]>([]);

  // Khi load trang, lấy danh sách category và thông tin sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes, colorRes, ramRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category"),
          axios.get(`http://localhost:5000/api/products/${id}`),
          axios.get("http://localhost:5000/api/colors"),
          axios.get("http://localhost:5000/api/rams"),
        ]);

        const categoryList = categoryRes.data as ICategory[];
        setCategories(categoryList);
        setColors(colorRes.data as IColor[]);
        setRams(ramRes.data as IRam[]);

        const product = productRes.data;

        const loadedVariants: VariantInput[] = (product.variants || []).map((v: any) => ({
          color: v.color || "",
          ram: v.ram || "",
          price: v.price || 0,
          soluong: v.soluong || 0,
        }));

        const matchedCategory = categoryList.find(
          (cat) => cat.name === product.danhmuc || cat._id === product.danhmuc
        );

        reset({
          name: product.name || "",
          image: product.image || "",
          albumImages: product.albumImages || [],
          price: product.price || 0,
          soluong: product.soluong || 0,
          mota: product.mota || "",
          danhmuc: matchedCategory ? matchedCategory.name : "",
          trangthai: product.trangthai || "còn bán",
          variants: loadedVariants,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    if (id) fetchData();
  }, [id, reset]);


  // Khi variants thay đổi, tự tính tổng soluong và gán vào form
  useEffect(() => {
    const total = watchedVariants.reduce((sum, v) => sum + (v.soluong || 0), 0);
    setValue("soluong", total);
  }, [watchedVariants, setValue]);

  // Upload ảnh chính
  const uploadImage = async (file: RcFile | null) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "datn-xphone");
    const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";

    try {
      const { data } = await axios.post(endPoint, formData);
      setValue("image", data.url, { shouldValidate: true });
      message.success("Tải ảnh chính thành công");
    } catch (error) {
      console.error(error);
      message.error("Lỗi upload ảnh chính");
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh phụ
  const uploadAlbumImages = async (files: RcFile[] | null) => {
    if (!files || files.length === 0) return;
    setAlbumLoading(true);

    try {
      const uploadPromises = files.map(async (fileItem) => {
        const formData = new FormData();
        formData.append("file", fileItem);
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
      console.error(error);
      message.error("Lỗi upload ảnh phụ");
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

  // useFieldArray cho biến thể
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Xử lý submit form
  const onSubmit = async (data: IProductForm) => {
  try {
    // Kiểm tra danh mục
    const selectedCategory = categories.find((c) => c.name === data.danhmuc);
    if (!selectedCategory) {
      message.error("Không tìm thấy danh mục đã chọn");
      return;
    }

    // Kiểm tra ảnh chính
    if (!data.image) {
      message.error("Vui lòng chọn ảnh chính");
      return;
    }

    // Kiểm tra ảnh phụ
    if (!data.albumImages.length) {
      message.error("Vui lòng chọn ít nhất một ảnh phụ");
      return;
    }

    // Kiểm tra biến thể
    const variantSet = new Set();
    for (let i = 0; i < data.variants.length; i++) {
      const v = data.variants[i];

      if (!v.color) {
        message.error(`Biến thể thứ ${i + 1} chưa chọn màu`);
        return;
      }

      if (!v.ram) {
        message.error(`Biến thể thứ ${i + 1} chưa chọn RAM`);
        return;
      }

      if (v.price === undefined || v.price === null || v.price === 0) {
        message.error(`Biến thể thứ ${i + 1} chưa nhập giá`);
        return;
      }

      if (v.soluong === undefined || v.soluong === null || v.soluong === 0) {
        message.error(`Biến thể thứ ${i + 1} chưa nhập số lượng`);
        return;
      }

      // Kiểm tra trùng
      const key = `${v.color.trim().toLowerCase()}-${v.ram.trim().toLowerCase()}`;
      if (variantSet.has(key)) {
        message.error(`Biến thể thứ ${i + 1} trùng màu + RAM với biến thể khác. Vui lòng sửa lại.`);
        return;
      }
      variantSet.add(key);
    }

    // Tạo payload
    const updatedData = {
      name: data.name,
      image: data.image,
      albumImages: data.albumImages,
      price: data.price,
      soluong: data.soluong,
      mota: data.mota,
      danhmuc: selectedCategory._id,
      trangthai: data.trangthai,
      status: true,
      variants: data.variants.map((v) => ({
        color: v.color,
        ram: v.ram,
        price: v.price,
        soluong: v.soluong,
      })),
    };

    await axios.put(`http://localhost:5000/api/products/${id}`, updatedData);
    message.success("Cập nhật sản phẩm thành công");
    nav("/admin/phone/list", { state: { forceReload: true } });
  } catch (err) {
    console.error(err);
    message.error("Cập nhật thất bại");
  }
};


  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-6 bg-white rounded shadow-md"
    >
      <h2 className="text-xl font-semibold text-center mb-4">Cập nhật sản phẩm</h2>

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
            uploadImage(file);
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
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh phụ</Button>
        </Upload>
        {albumLoading && <Spin style={{ marginLeft: 10 }} />}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 8,
          }}
        >
          {albumImages?.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={img}
                alt={`Ảnh phụ ${index + 1}`}
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

      {/* Số lượng tổng (readonly, do useEffect tính) */}
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
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.name,
              }))}
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

      {/* Biến thể */}
      <Form.Item label="Biến thể (Màu; RAM; Số lượng; Giá)">
        {variantFields.map((field, index) => (
          <Space
            key={field.id}
            align="baseline"
            style={{ marginBottom: 8, display: "flex", width: "100%", flexWrap: "wrap" }}
          >
            {/* Ô nhập màu sắc */}
            <Controller
              name={`variants.${index}.color`}
              control={control}
              rules={{ required: "Chọn màu sắc" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn màu"
                  style={{ width: 150 }}
                  onChange={field.onChange}
                  value={field.value}
                >
                  {colors.map((color) => (
                    <Select.Option key={color._id} value={color.name}>
                      {color.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />

            {/* Chọn RAM từ API */}
            <Controller
              name={`variants.${index}.ram`}
              control={control}
              rules={{ required: "Chọn RAM" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn RAM"
                  style={{ width: 100 }}
                  onChange={field.onChange}
                  value={field.value}
                >
                  {rams.map((ram) => (
                    <Select.Option key={ram._id} value={ram.size}>
                      {ram.size}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />

            {/* Ô nhập số lượng biến thể */}
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

            {/* Ô nhập giá biến thể */}
            <Controller
              name={`variants.${index}.price`}
              control={control}
              rules={{ required: "Nhập giá biến thể" }}
              render={({ field }) => (
                <InputNumber<number>
                  min={0}
                  placeholder="Giá"
                  style={{ width: 120 }}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
          onClick={() => appendVariant({ color: "", ram: "", price: 0, soluong: 0 })}
          block
          icon={<PlusOutlined />}
        >
          Thêm biến thể
        </Button>
      </Form.Item>

      {/* Nút submit */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading || albumLoading}
        >
          Cập nhật sản phẩm
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PutEdit;
