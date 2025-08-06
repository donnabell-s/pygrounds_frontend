import React from "react";
import { FaArrowLeft } from "react-icons/fa";

interface BackButtonProps {
  onClick?: () => void;           // Action to trigger on click
  label?: string;                 // Button text
  fontSize?: string;              // Tailwind text size (e.g. "text-sm", "text-base")
  fontWeight?: string;            // Tailwind font weight (e.g. "font-medium", "font-semibold")
  iconSize?: number;              // Icon size in px
  className?: string;             // Extra custom styles
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Back",
  fontSize = "text-sm",
  fontWeight = "font-medium",
  iconSize = 12,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 bg-white border border-[#D1D5DB] rounded-lg 
        hover:bg-gray-100 transition-colors cursor-pointer 
        flex flex-row justify-center items-center gap-2 ${fontSize} ${fontWeight} ${className}`}
    >
      <FaArrowLeft size={iconSize} />
      {label}
    </button>
  );
};

export default BackButton;
