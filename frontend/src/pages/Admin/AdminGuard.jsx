import { Navigate } from "react-router-dom";

const AdminGuard = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  // No token → redirect to login
  if (!token) return <Navigate to="/admin/login" replace />;

  // Token exists but user isn't admin → redirect to login
  if (user?.role && user.role !== "admin") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
