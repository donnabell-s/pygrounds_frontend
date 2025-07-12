import React from "react";

interface ProfileDropdownProps {
    icon: React.ReactNode;
    label: string;
}

const ProfileDropdownLink: React.FC<ProfileDropdownProps> = ({ icon, label}) => {
    return (
        <div
            className="flex flex-row text-sm items-center gap-2 cursor-pointer 
                hover:text-[#3776AB]
                transition duration-200 ease-in-out`"
        >
            <span>{icon}</span>
            <p>{label}</p>
        </div>
    )
}

export default ProfileDropdownLink;