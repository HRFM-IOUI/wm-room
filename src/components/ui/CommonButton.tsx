import React, { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "white";

type CommonButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const CommonButton: React.FC<CommonButtonProps> = ({
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "default",
  ...props
}) => {
  const baseStyle =
    "font-semibold px-4 py-2 rounded transition shadow disabled:bg-gray-300 disabled:cursor-not-allowed";

  const variantStyle =
    {
      default: "bg-theme-pink text-white hover:bg-theme-pink-dark",
      white: "bg-white text-gray-800 hover:bg-gray-100 border",
    }[variant] ?? "";

  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default CommonButton;
