import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
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
        const productRes = await axios.get(`http://localhost:5000/api/products/${id}`);
        const currentProduct = productRes.data;
        if (isMounted) setProduct(currentProduct);

        const allRes = await axios.get("http://localhost:5000/api/products");
        const filtered = allRes.data.filter(
          (p: IProduct) =>
            p._id !== currentProduct._id && p.danhmuc === currentProduct.danhmuc
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
    <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0">
      <div className="flex items-center gap-3">
        
        <h6 className=" font-semibold">Sản phẩm liên quan</h6>
      </div>
      <div className="mt-6" />
      <div
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Tooltip title="Sang trái" placement="left">
          {isHovering && displayProducts.length > 1 && (
            <button
              onClick={() => rotate("left")}
              aria-label="Xoay sản phẩm sang trái"
              className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors z-10"
            >
              <LeftOutlined className="text-xl" />
            </button>
          )}
        </Tooltip>
        <div className="flex gap-4 overflow-hidden">
          {displayProducts.length > 0 ? (
            displayProducts.map((item) => (
              <Link
                to={`/detail/${item._id}`}
                key={item._id}
                className="flex-shrink-0 w-60 border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <img
                  src={item.image || "/default-image.jpg"}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-red-600 font-bold">
                      {item.price || "Liên hệ"}
                    </p>
                    <button
                      aria-label={`Thêm ${item.name} vào giỏ hàng`}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <ShoppingCartOutlined className="text-xl" />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center w-full text-gray-500">
              Không có sản phẩm liên quan.
            </p>
          )}
        </div>
        <Tooltip title="Sang phải" placement="right">
          {isHovering && displayProducts.length > 1 && (
            <button
              onClick={() => rotate("right")}
              aria-label="Xoay sản phẩm sang phải"
              className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors z-10"
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