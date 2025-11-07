import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context";
import { PATHS } from "../constants";

interface ProtectedAdminRouteProps {
  children?: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }
  if (!user) {
    return <Navigate to={PATHS.ADMIN_LOGIN.path} replace />;
  }

  const adminUser = user as any;
  const hasAdminAccess = adminUser.is_staff || adminUser.is_superuser || adminUser.role === 'admin';
  
  if (!hasAdminAccess) {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession);
        const sessionHasAdminAccess = sessionData.is_staff || sessionData.is_superuser || sessionData.role === 'admin';
        if (sessionHasAdminAccess) {
          return children ? <>{children}</> : <Outlet />;
        }
      } catch (e) {
        console.error("Failed to parse admin session data:", e);
      }
    }
    
    return <Navigate to={PATHS.LANDING.path} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedAdminRoute;