import React from "react";
import * as Component from "../../components";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaBookOpen, FaUpload, FaUsers } from "react-icons/fa";
import { BsDiagram3 } from "react-icons/bs";

interface AdminSideNavProps {
  nav: boolean;
}

const AdminSideNav: React.FC<AdminSideNavProps> = ({ nav }) => {
  return (
    <div
      className={`fixed top-0 left-0 bg-white w-64 h-screen flex flex-col overflow-y-auto shadow-md transition-transform duration-300 ease-in-out z-20 pt-16
      ${nav 
        ? "translate-x-0" 
        : "-translate-x-full"
      } 
      sm:translate-x-0`}
    >
        <Component.AdminSideNavLinkDropdown
        icon={<MdAdminPanelSettings size={20} />}
        label="Admin View"
        linkKey="ADMIN_VIEWS" // ✅ direct link to a flat route
        />

        <Component.AdminSideNavLinkDropdown
        icon={<BsDiagram3 size={20} />}
        label="Topic Management"
        linkKey="TOPIC_MANAGEMENT"
        />

        <Component.AdminSideNavLinkDropdown
        icon={<FaBookOpen size={20} />}
        label="Question Management"
        linkKey="QUESTION_MANAGEMENT"
        />

        <Component.AdminSideNavLinkDropdown
        icon={<FaUpload size={20} />}
        label="Content Upload"
        linkKey="CONTENT_UPLOAD"
        />

        <Component.AdminSideNavLinkDropdown
        icon={<FaUsers size={20} />}
        label="User Management"
        linkKey="USER_MANAGEMENT"
        />

    </div>
  );
};

export default AdminSideNav;
