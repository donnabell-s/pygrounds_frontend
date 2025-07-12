import React, { useState, useRef, useEffect }  from "react"
import { FiLogOut, FiSettings } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import * as Components from "../../components"

const ProfileDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    return (
        <div className="relative flex items-center h-full" ref={dropdownRef}>
            <button onClick={() => setOpen(!open)} className="focus:outline-none flex flex-row justify-center items-center gap-2">
                <img className="h-10 w-10 bg-[#D9D9D9] rounded-full" ></img>
                <p className="text-sm">Julien Veniz</p>
                  <FaCaretDown
                    className={`text-sm transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                    }`}
                />
            </button>
            <div
                className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-md z-50 transform transition-all p-5 duration-300 ease-out 
                ${open ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                shadow-[0_0_9px_rgba(0,0,0,0.1)]`}>
                <div className="pb-2 flex flex-row gap-2 items-center text-sm">
                    <img className="h-9 w-9 rounded-full bg-[#D9D9D9]" ></img>
                    <div>
                      <p>Julien Veniz</p>
                      <p className="text-xs text-[#6B7280]">@benizz</p>
                    </div>
                </div>
                <div className="border-t border-[#D9D9D9] my-2"></div>
                <div className="flex flex-col gap-3 mt-3 mx-1">
                    <Components.ProfileDropdownLink label="Settings" icon={<FiSettings size={16}/>}/>
                    <Components.ProfileDropdownLink label="Logout" icon={<FiLogOut size={16}/>}/>
                </div>
            </div>
        </div>
    )
}

export default ProfileDropdown;