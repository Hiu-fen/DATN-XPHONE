import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { message } from "antd";
import { useNavigate, useParams } from "react-router-dom";

interface IProduct {
  name: string;
  image: string;
  albumImages: string[];
  price: number;
  soluong: number;
  mota: string;
  danhmuc: string; // ID danh mục
  trangthai: string;
}

interface ICategory {
  _id: string;
  name: string;
}

const PutEdit = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const {
    register,
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

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [ablumLoading, setAblumLoading] = useState(false);

  const image = watch("image");
  const ablumImage = watch("albumImages");

  // Lấy danh sách danh mục và sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category"),
          axios.get(`http://localhost:5000/api/products/${id}`),
        ]);

        const categoryList = categoryRes.data;
        setCategories(categoryList);

        const product = productRes.data;

        // Nếu product.danhmuc đang là tên thì tìm _id tương ứng
const matchedCategory = categoryList.find(
  (cat: ICategory) => cat.name === product.danhmuc || cat._id === product.danhmuc
);



        reset({
          name: product.name || "",
          image: product.image || "",
          albumImages: product.albumImages || [],
          price: product.price || 0,
          soluong: product.soluong || 0,
          mota: product.mota || "",
          danhmuc: matchedCategory?.name || "",

          trangthai: product.trangthai || "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    if (id) fetchData();
  }, [id, reset]);

  const upLoadImage = async (file: FileList | null) => {
    if (!file || file.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file[0]);
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

  const upLoadAblumImage = async (file: FileList | null) => {
    if (!file || file.length === 0) return;
    setAblumLoading(true);

    try {
      const uploadPromises = Array.from(file).map(async (fileItem) => {
        const formData = new FormData();
        formData.append("file", fileItem);
        formData.append("upload_preset", "datn-xphone");
        const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";
        const { data } = await axios.post(endPoint, formData);
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      const newAlbum = [...ablumImage, ...urls];
      setValue("albumImages", newAlbum, { shouldValidate: true });
      message.success("Tải ảnh phụ thành công");
    } catch (error) {
      console.error(error);
      message.error("Lỗi upload ảnh phụ");
    } finally {
      setAblumLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...ablumImage];
    updated.splice(index, 1);
    setValue("albumImages", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: IProduct) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, data);
      message.success("Cập nhật sản phẩm thành công");
      nav("/admin/phone/list", { state: { forceReload: true } });
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-6 bg-white rounded shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold text-center mb-4">Cập nhật sản phẩm</h2>

      {/* Tên sản phẩm */}
      <div>
        <label className="block mb-1 font-medium">Tên sản phẩm</label>
        <input
          type="text"
          {...register("name", { required: "Vui lòng nhập tên sản phẩm" })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>
      </div>

      {/* Hình ảnh chính */}
      <div>
        <label className="block mb-1 font-medium">Hình ảnh chính</label>
        <input type="file" accept="image/*" onChange={(e) => upLoadImage(e.target.files)} />
        {loading && <p>Đang tải ảnh chính...</p>}
        {image && (
          <img
            src={image}
            alt="Ảnh chính"
            className="mt-2 rounded"
            style={{ maxWidth: "150px", maxHeight: "150px" }}
          />
        )}
        <input type="hidden" {...register("image", { required: "Ảnh chính không được để trống" })} />
        <p className="text-red-500 text-sm">{errors.image?.message}</p>
      </div>

      {/* Ảnh phụ */}
      <div>
        <label className="block mb-1 font-medium">Ảnh phụ</label>
        <input type="file" accept="image/*" multiple onChange={(e) => upLoadAblumImage(e.target.files)} />
        {ablumLoading && <p>Đang tải ảnh phụ...</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {ablumImage?.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`Ảnh phụ ${index + 1}`}
                className="rounded"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input
          type="hidden"
          {...register("albumImages", {
            validate: (value) => (value && value.length > 0) || "Ảnh phụ không được để trống",
          })}
        />
        <p className="text-red-500 text-sm">{errors.albumImages?.message}</p>
      </div>

      {/* Giá */}
      <div>
        <label className="block mb-1 font-medium">Giá</label>
        <input
          type="number"
          {...register("price", {
            required: "Vui lòng nhập giá",
            min: { value: 1, message: "Giá phải lớn hơn 0" },
          })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.price?.message}</p>
      </div>

      {/* Số lượng */}
      <div>
        <label className="block mb-1 font-medium">Số lượng</label>
        <input
          type="number"
          {...register("soluong", {
            required: "Vui lòng nhập số lượng",
            min: { value: 1, message: "Số lượng phải lớn hơn 0" },
          })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.soluong?.message}</p>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block mb-1 font-medium">Mô tả</label>
        <textarea {...register("mota")} className="w-full px-3 py-2 border rounded" />
      </div>

      {/* Danh mục */}
      <div>
        <label className="block mb-1 font-medium">Danh mục</label>
        <select
          {...register("danhmuc", { required: "Vui lòng chọn danh mục" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
  <option key={cat._id} value={cat.name}>
    {cat.name}
  </option>
))}
        </select>
        <p className="text-red-500 text-sm">{errors.danhmuc?.message}</p>
      </div>

      {/* Trạng thái */}
      <div>
        <label className="block mb-1 font-medium">Trạng thái</label>
        <select
          {...register("trangthai", { required: "Vui lòng chọn trạng thái" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">-- Chọn trạng thái --</option>
          <option value="còn hàng">Còn hàng</option>
          <option value="hết hàng">Hết hàng</option>
        </select>
        <p className="text-red-500 text-sm">{errors.trangthai?.message}</p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Cập nhật sản phẩm
      </button>
    </form>
  );
};

export default PutEdit;
