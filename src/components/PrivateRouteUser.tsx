import { Navigate } from "react-router-dom";

const PrivateRouteUser = ({ children }: { children: JSX.Element }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== 'user' || user.active === false) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRouteUser;
