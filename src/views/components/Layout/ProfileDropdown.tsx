import React, { useState, useRef, useEffect } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import * as Components from "../../components";

interface ProfileDropdownProps {
  mobile?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ mobile = false }) => {
  // const [open, setOpen] = useState(false);
  // const dropdownRef = useRef<HTMLDivElement>(null);

  if (mobile) {
    return (
      <div className="w-full">
        <div className="pb-2 flex flex-row gap-2 items-center text-sm">
          <img className="h-9 w-9 rounded-full bg-[#D9D9D9]" alt="Profile" />
          <div>
            <p>Julien Veniz</p>
            <p className="text-xs text-[#6B7280]">@benizz</p>
          </div>
        </div>
        <div className="border-t border-[#D9D9D9] my-2"></div>
        <div className="flex flex-col gap-3 mx-0">
          <Components.ProfileDropdownLink 
            label="Settings" 
            icon={<FiSettings size={20}/>}
            mobile={true}
          />
          <Components.ProfileDropdownLink 
            label="Logout" 
            icon={<FiLogOut size={20}/>}
            mobile={true}
          />
        </div>
      </div>
    );
  }

  const [isOpen, setIsOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center h-full" ref={desktopDropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="focus:outline-none flex flex-row justify-center items-center gap-2"
      >
        <div className="flex items-center gap-2">
          <img className="h-10 w-10 bg-[#D9D9D9] rounded-full" alt="Profile" />
          <p className="text-sm">Julien Veniz</p>
        </div>
        <FaCaretDown
          className={`text-sm transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-md z-50 transform transition-all p-5 duration-300 ease-out shadow-[0_0_9px_rgba(0,0,0,0.1)] ${
              isOpen
          ? 'opacity-100 translate-y-0 visible'
          : 'opacity-0 -translate-y-3 invisible'
        }`}
      >
        <div className="pb-2 flex flex-row gap-2 items-center text-sm">
          <img className="h-9 w-9 rounded-full bg-[#D9D9D9]" alt="Profile" />
          <div>
            <p>Julien Veniz</p>
            <p className="text-xs text-[#6B7280]">@benizz</p>
          </div>
        </div>
        <div className="border-t border-[#D9D9D9] my-2"></div>
        <div className="flex flex-col gap-3 mx-1">
          <Components.ProfileDropdownLink 
            label="Settings" 
            icon={<FiSettings size={16}/>}
          />
          <Components.ProfileDropdownLink 
            label="Logout" 
            icon={<FiLogOut size={16}/>}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;