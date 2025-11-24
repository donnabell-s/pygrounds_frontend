import React from "react";

interface DynamicButtonProps {
  label: string;
  fontSize?: string;
  fontWeight?: string;
  onClick?: () => void;
  className?: string;

  // New flexible API
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Back-compat (optional)
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";

  px?: string;
  py?: string;
  m?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  label,
  fontSize = "text-lg",
  fontWeight = "font-semibold",
  onClick,
  className = "",
  leftIcon,
  rightIcon,
  icon,                 // back-compat
  iconPosition,         // back-compat
  px = "px-5",
  py = "py-4",
  m = "mt-0",
  type = "button",
  disabled = false,
}) => {
  // Resolve icons (new API wins; fall back to old one)
  const resolvedLeftIcon =
    leftIcon ?? (icon && iconPosition === "left" ? icon : null);
  const resolvedRightIcon =
    rightIcon ?? (icon && iconPosition === "right" ? icon : null);

  const gapClass = resolvedLeftIcon || resolvedRightIcon ? "gap-2" : "gap-0";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center ${gapClass} rounded-full
        bg-[#7053D0] text-white hover:bg-[#482986]
        shadow-sm hover:shadow-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#EAE7FE] focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
        ${fontSize} ${fontWeight} ${px} ${py} ${m} ${className}`}
    >
      {resolvedLeftIcon && <span className="inline-flex items-center">{resolvedLeftIcon}</span>}
      {label}
      {resolvedRightIcon && <span className="inline-flex items-center">{resolvedRightIcon}</span>}
    </button>
  );
};

export default DynamicButton;
