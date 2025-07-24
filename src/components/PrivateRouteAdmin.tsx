// components/PrivateRouteAdmin.tsx
import { Navigate } from "react-router-dom";

const PrivateRouteAdmin = ({ children }: { children: JSX.Element }) => {
  const user = JSON.parse(localStorage.getItem("admin") || "null");
if (!user || user.role !== 'admin' || user.active === false) {
  // Chặn truy cập nếu bị tạm dừng
  return <Navigate to="/admin/login" />;
}

  return children;
};

export default PrivateRouteAdmin;
