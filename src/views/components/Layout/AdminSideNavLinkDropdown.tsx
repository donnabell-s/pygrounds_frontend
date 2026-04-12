import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import * as Component from "../../components";
import { PATHS } from "../../../constants";
import {
  MdDashboard,
  MdNotifications,
} from "react-icons/md";
import {
  FaSitemap,
  FaFolderOpen,
  FaFileUpload,
  FaUsers,
  FaFlag,
} from "react-icons/fa";

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <MdDashboard />,
  notifications: <MdNotifications />,
  zone: <FaSitemap />,
  topic: <FaSitemap />,
  subtopic: <FaSitemap />,
  view_questions: <FaFolderOpen />,
  flagged_questions: <FaFlag />,
  content_upload: <FaFileUpload />,
  view_users: <FaUsers />,
};

interface AdminSideNavLinkDropdownProps {
  label: string;
  icon: React.ReactNode;
  linkKey: keyof typeof PATHS.ADMIN_VIEW;
}

const AdminSideNavLinkDropdown: React.FC<AdminSideNavLinkDropdownProps> = ({
  label,
  icon,
  linkKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const section = PATHS.ADMIN_VIEW[linkKey];

  const links =
    section && typeof section === "object" && !("path" in section)
      ? Object.entries(section).map(([subKey, value]: any) => ({
          label: value.label,
          path: value.path,
          icon: iconMap[subKey.toLowerCase()] ?? null,
        }))
      : [
          {
            label: section?.label,
            path: section?.path,
            icon: iconMap[linkKey.toLowerCase()] ?? null,
          },
        ];

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer text-gray-800 text-md font-medium ${
          isOpen ? "bg-gray-100" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="w-6 flex items-center justify-center">{icon}</span>
          <p>{label}</p>
        </div>
        <span
        className={`transition-transform duration-300 ${
            isOpen ? "rotate-90" : "rotate-0"
        }`}
        >
        <IoIosArrowForward size={20} />
        </span>

      </div>

      <div
        className={`flex flex-col overflow-hidden transition-[max-height] duration-300 ease-in-out`}
        style={{ maxHeight: isOpen ? `${links.length * 48}px` : "0" }}
      >
        {links.map((link) => (
          <Component.AdminSideNavLink
            key={link.path}
            label={link.label}
            icon={link.icon}
            path={link.path}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminSideNavLinkDropdown;
