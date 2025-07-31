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
  Modal,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, SwapOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { RcFile } from "antd/lib/upload";
import { IColor, IRam } from "../../../interface/variant";

interface VariantInput {
  color: string;
  ram: string;
  price: number;
  soluong: number;
}

interface IProductForm {
  name: string;
  image: string;
  albumImages: string[];
  soluong: number;
  mota?: string;
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
    mode: "onBlur",
    defaultValues: {
      name: "",
      image: "",
      albumImages: [],
      soluong: 0,
      mota: "",
      danhmuc: undefined as any,
      price: 0,
      trangthai: "còn bán",
      variants: [],
    },
  });

  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [colors, setColors] = useState<IColor[]>([]);
  const [rams, setRams] = useState<IRam[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [swapPosition, setSwapPosition] = useState<number | null>(null);

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    move: moveVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, colorRes, ramRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category"),
          axios.get("http://localhost:5000/api/colors"),
          axios.get("http://localhost:5000/api/rams"),
        ]);
        setCategories(categoryRes.data);
        setColors(colorRes.data);
        setRams(ramRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu danh mục, màu sắc hoặc RAM", err);
      }
    };

    fetchData();
  }, []);

  const image = watch("image");
  const albumImages = watch("albumImages");
  const watchedVariants = watch("variants") || [];

  useEffect(() => {
    const total = watchedVariants.reduce((sum, v) => sum + (v.soluong || 0), 0);
    setValue("soluong", total);
  }, [watchedVariants, setValue]);

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
      message.error("Lỗi tải ảnh chính");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      message.error("Lỗi tải ảnh phụ");
      console.error(err);
    } finally {
      setAlbumLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...albumImages];
    updated.splice(index, 1);
    setValue("albumImages", updated, { shouldValidate: true });
  };

  const handleSwapPosition = (index: number) => {
    setSelectedVariantIndex(index);
    setVisibleModal(true);
  };

  const confirmSwap = () => {
    if (selectedVariantIndex === null || swapPosition === null) {
      message.error("Vui lòng chọn vị trí để hoán đổi");
      return;
    }
    const totalVariants = variantFields.length;
    if (swapPosition < 1 || swapPosition > totalVariants) {
      message.error(`Vị trí phải từ 1 đến ${totalVariants}`);
      return;
    }
    if (swapPosition - 1 === selectedVariantIndex) {
      message.error("Vị trí hoán đổi không thể trùng với vị trí hiện tại");
      return;
    }
    moveVariant(selectedVariantIndex, swapPosition - 1);
    setVisibleModal(false);
    setSelectedVariantIndex(null);
    setSwapPosition(null);
    message.success("Hoán đổi vị trí thành công");
  };

  const onSubmit = async (data: IProductForm) => {
    try {
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

      const validVariants = data.variants.filter(
        (v) => v.color && v.ram && v.price && v.soluong
      );
      if (validVariants.length === 0) {
        message.error("Vui lòng thêm ít nhất một biến thể hợp lệ");
        return;
      }

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

        const key = `${v.color.trim().toLowerCase()}-${v.ram.trim().toLowerCase()}`;
        if (variantSet.has(key)) {
          message.error(`Biến thể thứ ${i + 1} bị trùng màu + RAM với biến thể khác. Vui lòng chọn khác`);
          return;
        }
        variantSet.add(key);
      }

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

      reset({
        name: "",
        image: "",
        albumImages: [],
        soluong: 0,
        mota: "",
        danhmuc: undefined as any,
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
            <InputNumber
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
            <InputNumber
              {...field}
              min={0}
              style={{ width: "100%" }}
              disabled
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Mô tả">
        <Controller
          name="mota"
          control={control}
          render={({ field }) => <TextArea rows={3} {...field} />}
        />
      </Form.Item>

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
              placeholder="-- Chọn danh mục --"
              allowClear
              {...field}
              value={field.value ?? undefined}
            >
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item label="Biến thể (Màu; RAM; Số lượng; Giá)">
        {variantFields.map((field, index) => (
          <Space
            key={field.id}
            align="baseline"
            style={{ marginBottom: 8, display: "flex", width: "100%", flexWrap: "wrap" }}
          >
            <div style={{ width: 50, textAlign: "center" }}>
              <span>{index + 1}</span>
            </div>
            <Controller
              name={`variants.${index}.color`}
              control={control}
              rules={{ required: "Chọn màu sắc" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn màu"
                  style={{ width: 150 }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => field.onChange(value)}
                >
                  {colors.map((color) => (
                    <Select.Option key={color._id} value={color.name}>
                      {color.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
            <Controller
              name={`variants.${index}.ram`}
              control={control}
              rules={{ required: "Chọn RAM" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn RAM"
                  style={{ width: 100 }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => field.onChange(value)}
                >
                  {rams.map((ram) => (
                    <Select.Option key={ram._id} value={ram.size}>
                      {ram.size}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
            <Controller
              name={`variants.${index}.soluong`}
              control={control}
              rules={{ required: "Nhập số lượng biến thể" }}
              render={({ field }) => (
                <InputNumber
                  min={0}
                  placeholder="Số lượng"
                  style={{ width: 120 }}
                  {...field}
                />
              )}
            />
            <Controller
              name={`variants.${index}.price`}
              control={control}
              rules={{ required: "Nhập giá biến thể" }}
              render={({ field }) => (
                <InputNumber
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
            <Button
              icon={<SwapOutlined />}
              size="small"
              onClick={() => handleSwapPosition(index)}
              style={{ marginLeft: 8 }}
            >
              Đổi vị trí
            </Button>
            <MinusCircleOutlined
              onClick={() => removeVariant(index)}
              style={{ marginLeft: 8, color: "#ff4d4f", cursor: "pointer" }}
            />
          </Space>
        ))}
        <Modal
          title="Chọn vị trí để hoán đổi"
          open={visibleModal}
          onOk={confirmSwap}
          onCancel={() => {
            setVisibleModal(false);
            setSelectedVariantIndex(null);
            setSwapPosition(null);
          }}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn số thứ tự để hoán đổi"
            onChange={(value) => setSwapPosition(value)}
            value={swapPosition}
          >
            {variantFields.map((_, idx) => (
              idx !== selectedVariantIndex && (
                <Select.Option key={idx} value={idx + 1}>
                  {idx + 1}
                </Select.Option>
              )
            ))}
          </Select>
        </Modal>
        <Button
          type="dashed"
          onClick={() =>
            appendVariant({ color: "", ram: "", soluong: undefined as any, price: undefined as any })
          }
          block
          icon={<PlusOutlined />}
          style={{ marginTop: 8 }}
        >
          Thêm biến thể
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm sản phẩm
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProduct;