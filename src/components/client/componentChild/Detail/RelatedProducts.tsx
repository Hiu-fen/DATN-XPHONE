import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  EyeOutlined,
  LeftOutlined,
  RightOutlined,

} from "@ant-design/icons";
import { message, Tooltip } from "antd";
import { IProduct } from "../../../../interface/product";

const RelatedProducts = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [, setRelatedProducts] = useState<IProduct[]>([]);
  const [displayProducts, setDisplayProducts] = useState<IProduct[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProductAndRelated = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        const currentProduct = productRes.data;
        if (isMounted) setProduct(currentProduct);

        const allRes = await axios.get("http://localhost:5000/api/products");
        const filtered = allRes.data.filter(
          (p: IProduct) =>
            p._id !== currentProduct._id &&
            p.danhmuc === currentProduct.danhmuc
        );
        if (isMounted) {
          setRelatedProducts(filtered.slice(0, 4));
          setDisplayProducts(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
        message.error("Không thể tải sản phẩm liên quan.");
      }
    };
    if (id) fetchProductAndRelated();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const rotate = (direction: "left" | "right") => {
    const newData = [...displayProducts];
    if (direction === "left") {
      const last = newData.pop();
      if (last) newData.unshift(last);
    } else {
      const first = newData.shift();
      if (first) newData.push(first);
    }
    setDisplayProducts(newData);
  };

  if (!product) return null;

  return (
    <section className="max-w-6xl mx-auto mt-16 px-4 md:px-0">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold border-b-2 border-red-500 inline-block pb-1">
          Sản phẩm liên quan
        </h2>
      </div>

      <div
        className="relative group mt-6"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Nút trái */}
        <Tooltip title="Sang trái" placement="left">
          {isHovering && displayProducts.length > 1 && (
            <button
              onClick={() => rotate("left")}
              aria-label="Xoay sản phẩm sang trái"
              className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 
              bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors z-10"
            >
              <LeftOutlined className="text-xl" />
            </button>
          )}
        </Tooltip>

        {/* Danh sách sản phẩm */}
        <div className="flex gap-6 overflow-hidden">
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {displayProducts.slice(0, 4).map((item) => (
                <Link
                  to={`/detail/${item._id}`}
                  key={item._id}
                  className="border rounded-lg overflow-hidden bg-white 
                   hover:shadow-2xl transition-all duration-300 transform 
                   hover:-translate-y-2 hover:scale-105"
                >
                  <img
                    src={item.image || "/default-image.jpg"}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>

                    {/* Giá + nút xem chi tiết */}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-red-600 font-bold">
                        {item.price || "Liên hệ"}
                      </p>
                      <button
                        aria-label={`Xem chi tiết ${item.name}`}
                        className="text-gray-600 hover:text-red-600 transition-transform transform hover:scale-125"
                      >
                        <EyeOutlined className="text-xl" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center w-full text-gray-500">
              Không có sản phẩm liên quan.
            </p>
          )}
        </div>

        {/* Nút phải */}
        <Tooltip title="Sang phải" placement="right">
          {isHovering && displayProducts.length > 1 && (
            <button
              onClick={() => rotate("right")}
              aria-label="Xoay sản phẩm sang phải"
              className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 
              bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors z-10"
            >
              <RightOutlined className="text-xl" />
            </button>
          )}
        </Tooltip>
      </div>
    </section>
  );
};

export default RelatedProducts;
