import React from "react";

interface ProfileDropdownLinkProps {
  icon: React.ReactNode;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}

const ProfileDropdownLink: React.FC<ProfileDropdownLinkProps> = ({ icon, label,mobile = false,onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 hover:text-[#3776AB] transition-colors cursor-pointer ${
        mobile ? 'py-3 text-lg w-full' : 'text-sm'
      }`}
      aria-label={label}
    >
      <span className={`${mobile ? 'text-gray-500' : 'text-current'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
};

export default ProfileDropdownLink;