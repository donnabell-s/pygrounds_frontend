import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface HeaderLinkProps {
  label: string;
  route: string;
  mobile?: boolean;
  onClick?: () => void;
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ label, route, mobile = false, onClick }) => {
  const location = useLocation();
  const isSelected = location.pathname === route;

  // Mobile styles
  if (mobile) {
    return (
      <Link 
        to={route} 
        onClick={onClick}
        className={`block py-3 text-lg ${isSelected ? 'text-[#3776AB] font-medium' : 'text-gray-700 hover:text-[#3776AB]'}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link to={route}>
      <div className="h-[64px] px-3 flex items-center justify-center relative font-medium">
        <p className={`${isSelected ? 'text-[#3776AB]' : 'hover:text-[#3776AB]'}`}>
          {label}
        </p>
        <span
          className={`absolute -bottom-[2px] left-0 h-[2px] bg-[#3776AB] transition-all duration-300 ease-in-out ${
            isSelected ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`}
        />
      </div>
    </Link>
  );
};

export default HeaderLink;