import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminSideNavLinkProps {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const AdminSideNavLink: React.FC<AdminSideNavLinkProps> = ({ label, icon, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.includes(path);

  return (
    <div
      onClick={() => navigate(path)}
      className={`flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer rounded-md text-gray-800 text-md font-medium ${
        isActive ? "bg-gray-100" : ""
      }`}
    >
      <div className="flex items-center gap-4 pl-7">
        <span className="w-6 flex items-center justify-center">{icon}</span>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default AdminSideNavLink;
