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

  // ✅ If no user is logged in, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ If roles are defined, check if user role is allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise, render children via <Outlet />
  return <Outlet />;
};

export default ProtectedRoute;
