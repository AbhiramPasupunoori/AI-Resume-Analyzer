import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/authContext";

function AdminRoute() {
  const { user } = useAuth();
  return user?.is_admin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default AdminRoute;
