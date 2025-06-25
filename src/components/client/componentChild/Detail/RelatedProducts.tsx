// src/components/Detail/RelatedProducts.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { IProduct } from "../../../../interface/product";

const RelatedProducts = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const relatedProductsRef = useRef<HTMLDivElement>(null);

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
        if (isMounted) setRelatedProducts(filtered.slice(0, 4));
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

  const scrollRelatedProducts = (direction: "left" | "right") => {
    if (relatedProductsRef.current) {
      const scrollAmount = 300;
      relatedProductsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!product) return null;

  return (
    <section className="max-w-5xl mx-auto mt-16 px-4 md:px-0 relative">
      <div className="flex items-center gap-3">
        <div className=" bg-red-500 w-[30px] rounded-lg h-[50px]" />
        <h6 className=" text-red-500 font-semibold">Sản phẩm liên quan</h6>
      </div>
      <br />
      <button
        onClick={() => scrollRelatedProducts("left")}
        className="hidden md:flex absolute -left-16 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 z-10 shadow"
      >
        <LeftOutlined className="text-3xl" />
      </button>
      <div className="relative">
        <div
          ref={relatedProductsRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide max-w-[1008px]"
        >
          {relatedProducts.length > 0 ? (
            relatedProducts.map((item) => (
              <Link
                to={`/detail/${item._id}`}
                key={item._id}
                className="flex-shrink-0 w-60 border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <img
                  src={item.image || "/default-image.jpg"}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-red-600 font-bold">
                      {item.price || "Liên hệ"}
                    </p>
                    <button className="text-gray-600 hover:text-red-600">
                      <ShoppingCartOutlined className="text-xl" />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Không có sản phẩm liên quan.</p>
          )}
        </div>
      </div>
      <button
        onClick={() => scrollRelatedProducts("right")}
        className="hidden md:flex absolute -right-16 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 z-10 shadow"
      >
        <RightOutlined className="text-3xl" />
      </button>
    </section>
  );
};

export default RelatedProducts;
