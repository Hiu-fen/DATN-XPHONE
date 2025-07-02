import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = ({ type = 'client' }: { type?: 'client' | 'admin' }) => {
  const navigate = useNavigate();
  const isAdmin = type === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      <Result
        status="404"
        title={
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-600 text-8xl md:text-9xl font-black animate-pulse">
            404
          </span>
        }
        subTitle={
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {isAdmin ? "Không tìm thấy trang trong khu vực quản trị." : "Oops! Trang bạn tìm không tồn tại."}
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto">
              {isAdmin
                ? "Trang này không tồn tại hoặc bạn không có quyền truy cập."
                : "Có thể đường dẫn sai hoặc sản phẩm không còn tồn tại. Quay về trang chủ để khám phá tiếp."}
            </p>
          </div>
        }
        extra={
          <Button
            type="primary"
            onClick={() => navigate(isAdmin ? "/admin" : "/")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300"
          >
            {isAdmin ? "Về quản trị" : "Về trang chủ"}
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
