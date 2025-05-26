import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { message } from "antd";
import { useNavigate, useParams } from "react-router-dom";

interface IProduct {
  name: string;
  image: string;
  price: number;
  soluong: number;
  mota: string;
  danhmuc: string; // dùng string vì _id là chuỗi
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
  } = useForm<IProduct>();

  const [categories, setCategories] = useState<ICategory[]>([]);

  // Lấy danh mục
  useEffect(() => {
    axios.get("http://localhost:5000/api/category").then((res) => {
      setCategories(res.data);
    });
  }, []);

  // Lấy thông tin sản phẩm hiện tại
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/products/${id}`)
        .then((res) => {
          const product = res.data;
          reset({
            name: product.name || "",
            image: product.image || "",
            price: product.price || 0,
            soluong: product.soluong || 0,
            mota: product.mota || "",
            danhmuc: product.danhmuc || "", // là _id của danh mục
            trangthai: product.trangthai || "",
          });
        })
        .catch((err) => console.log("Lỗi khi lấy sản phẩm:", err));
    }
  }, [id, reset]);

  const onSubmit = async (data: IProduct) => {
    try {
      const newData = {
        ...data,
        danhmuc: data.danhmuc, // là _id dạng string
      };

      await axios.put(`http://localhost:5000/api/products/${id}`, newData);
      message.success("Cập nhật thành công");
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
      <h2 className="text-xl font-semibold text-center mb-4">
        Cập nhật sản phẩm
      </h2>

      <div>
        <label className="block mb-1 font-medium">Tên sản phẩm</label>
        <input
          type="text"
          {...register("name", { required: "Vui lòng nhập tên sản phẩm" })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Hình ảnh</label>
        <input
          type="text"
          {...register("image", { required: "Vui lòng nhập URL hình ảnh" })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.image?.message}</p>
      </div>

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

      <div>
        <label className="block mb-1 font-medium">Số lương</label>
        <input
          type="number"
          {...register("soluong", {
            required: "Vui lòng nhập số lượng",
            min: {
              value: 1,
              message: "Số phải lớn hơn 0",
            },
          })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.soluong?.message}</p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Mô tả</label>
        <textarea
          {...register("mota")}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Danh mục</label>
        <select
          {...register("danhmuc", { required: "Không để trống" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-red-500 text-sm">{errors.danhmuc?.message}</p>
      </div>

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
