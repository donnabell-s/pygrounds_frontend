// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  roles?: string[]; // e.g., ['learner', 'admin']
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // or a proper loader
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0 && user.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
