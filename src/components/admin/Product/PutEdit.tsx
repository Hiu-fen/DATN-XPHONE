import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";

interface IProduct {
  name: string;
  image: string;
  price: number;
  mota: string;
  danhmuc: number;
  trangthai: string;
  albumId: number;
}

interface ICategory {
  id: number;
  name: string;
}

interface IAlbum {
  id: number;
  name: string;
}

const PutEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IProduct>();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true); // thêm trạng thái loading
  const { id } = useParams();
  const navigate = useNavigate();

    // Load danh mục
  useEffect(() => {
    axios.get("http://localhost:4000/category").then(res => setCategories(res.data));
  }, []);

  // Load album
  useEffect(() => {
    axios.get("http://localhost:4000/albums").then(res => setAlbums(res.data));
  }, []);

  // Load sản phẩm
  useEffect(() => {
    axios.get(`http://localhost:4000/products/${id}`)
      .then(res => setProductData(res.data))
      .catch(console.error);
  }, [id]);
  // Lấy dữ liệu sản phẩm theo ID
  useEffect(() => {
    setIsLoading(true); // bật loading khi bắt đầu fetch
    axios
      .get(`http://localhost:4000/products/${id}`)
      .then((res) => {
        const product = res.data;
        reset({
          ...product,
          danhmuc: Number(product.danhmuc),
          albumId: Number(product.albumId),
          trangthai: product.trangthai?.toLowerCase(),
        });
      })
      .catch((error) => {
        console.error("Lỗi khi lấy sản phẩm:", error);
      })
      .finally(() => {
        setIsLoading(false); // tắt loading khi fetch xong
      });
  }, [id, reset]);



  const onSubmit = async (data: IProduct) => {
    try {
          const newData = {
      ...data,
      danhmuc: Number(data.danhmuc), // Ép kiểu về số
    };
      await axios.put(`http://localhost:4000/products/${id}`, newData);
      message.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/phone/list");
    } catch (error) {
      message.error("Có lỗi khi cập nhật sản phẩm");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-6 bg-white rounded shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold text-center mb-4">Chỉnh sửa sản phẩm</h2>

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
            min: {
              value: 1,
              message: "Giá phải lớn hơn 0",
            },
          })}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-red-500 text-sm">{errors.price?.message}</p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Mô tả</label>
        <textarea
          {...register("mota")}
          className="w-full px-3 py-2 border rounded"
        ></textarea>
      </div>

      <div>
        <label className="block mb-1 font-medium">Danh mục</label>
        <select
          {...register("danhmuc", { required: "Không để trống" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
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

      <div>
        <label className="block mb-1 font-medium">Album ảnh</label>
        <select
          {...register("albumId", { required: "Vui lòng chọn album" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">-- Chọn album --</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.name}
            </option>
          ))}
        </select>
        <p className="text-red-500 text-sm">{errors.albumId?.message}</p>
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
function setProductData(data: any): any {
  throw new Error("Function not implemented.");
}

