import React from "react";

interface DynamicButtonProps {
  label: string;                  // Button text
  fontSize?: string;              // Tailwind text size, e.g. "text-lg"
  fontWeight?: string;            // Tailwind font weight, e.g. "font-semibold"
  onClick?: () => void;           // Click handler
  className?: string;             // Optional extra styles
  icon?: React.ReactNode;         // ⬅️ Optional icon (React Icons)
  iconPosition?: "left" | "right";
  px?: string;
  py?: string;
  m?: string;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  label,
  fontSize = "text-lg",
  fontWeight = "font-semibold",
  onClick,
  className = "",
  icon,
  iconPosition = "left",
  px = "px-5",
  py = "py-4",
  m = "mt-0"
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 bg-[#704EE7] text-white rounded-full hover:brightness-110 transition cursor-pointer ${fontSize} ${fontWeight} ${className} ${px} ${py} ${m}`}
    >
      {icon && iconPosition === "left" && icon}
      {label}
      {icon && iconPosition === "right" && icon}
    </button>
  );
};

export default DynamicButton;
