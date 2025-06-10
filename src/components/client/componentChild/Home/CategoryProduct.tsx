import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ICategory } from "../../../../interface/category";
import { getAllCategories } from "../../../../api/client/categoryApiClient";
import { Spin } from "antd";
import { useEffect } from "react";

const ProductCategory = () => {
  const { data, isLoading, refetch } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getAllCategories();
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, refetch]);

  // Skeleton cho danh mục
  const SkeletonCategory = () => (
    <div className="bg-gray-200 rounded-2xl shadow p-4 flex flex-col items-center min-w-[160px] animate-pulse">
      <div className="mb-2 w-20 h-20 bg-gray-300 rounded-full"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className="py-4 mx-24">
      <h3 className="text-center text-3xl font-semibold my-6">Danh mục sản phẩm</h3>

      <Spin spinning={isLoading} size="large" tip="Đang tải danh mục sản phẩm...">
        {isLoading ? (
          <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <SkeletonCategory key={idx} />
              ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
            {data.map((cat) => (
              <Link
                key={cat._id}
                to={`/product`}
                className="bg-gray-300 rounded-2xl shadow p-4 flex flex-col items-center hover:bg-gray-900 hover:text-white min-w-[160px]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="mb-2 w-20 h-20 object-cover rounded-full"
                />
                <span className="text-center font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-center text-gray-500 text-lg">
              Không có danh mục nào để hiển thị.
            </p>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ProductCategory;
