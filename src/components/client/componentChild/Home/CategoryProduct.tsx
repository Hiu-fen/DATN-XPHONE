import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ICategory } from "../../../../interface/category";
import { getAllCategories } from "../../../../api/client/categoryApiClient";
import { Spin, Skeleton, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductCategory = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [displayData, setDisplayData] = useState<ICategory[]>([]);

  const { data, isLoading } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getAllCategories();
      return res.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data) {
      setDisplayData(data);
    }
  }, [data]);

  const rotate = (direction: "left" | "right") => {
    const newData = [...displayData];
    if (direction === "left") {
      const last = newData.pop();
      if (last) newData.unshift(last);
    } else {
      const first = newData.shift();
      if (first) newData.push(first);
    }
    setDisplayData(newData);
  };


  return (
    <div className="py-4 mx-24">
      <h3 className="text-center text-3xl font-semibold my-4">Danh mục sản phẩm</h3>

      <Spin spinning={isLoading} size="large" tip="Đang tải danh mục sản phẩm...">
        <div
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Nút trái */}
          <Tooltip title='Sang phải' placement="left">
            {isHovering && (
              <button
                onClick={()=>rotate('left')}
                className="absolute left-[-29px] top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-200"
              >
                <FaChevronLeft />
              </button>
            )}
          </Tooltip>

          {/* Nút phải */}
          <Tooltip title='Sang phải' placement="right">
            {isHovering && (
              <button
                onClick={()=>rotate('right')}
                className="absolute right-[-21px] top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-200"
              >
                <FaChevronRight />
              </button>
            )}
          </Tooltip>

          {/* Danh sách danh mục */}
          <div className="flex gap-6 overflow-hidden transition-all duration-300 pb-4">
            {(isLoading ? Array(6).fill(0) : displayData)?.map((cat: any, idx: number) => (
              <div
                key={cat?._id || idx}
                className="min-w-[160px] flex-shrink-0 transition-all duration-300"
              >
                {isLoading ? (
                  <Skeleton
                    active
                    avatar={{ shape: "circle", size: 80 }}
                    paragraph={{ rows: 1 }}
                    className="p-4 rounded-2xl shadow bg-white"
                  />
                ) : (
                  <Link
                    to={`/product`}
                    className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="mb-2 w-20 h-20 object-cover rounded-full"
                    />
                    <span className="text-center font-medium">{cat.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ProductCategory;