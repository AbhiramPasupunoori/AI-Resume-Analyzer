import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/authContext";
import LoadingSpinner from "./LoadingSpinner";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="page auth-loading-page">
        <LoadingSpinner message="Checking your session..." />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
