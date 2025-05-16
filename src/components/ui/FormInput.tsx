import React, { InputHTMLAttributes } from "react";

type FormInputProps = {
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormInput: React.FC<FormInputProps> = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`
        w-full px-3 py-2 border border-theme-border rounded shadow-inner
        focus:outline-none focus:ring-2 focus:ring-theme-pink
        ${className}
      `}
      {...props}
    />
  );
};

export default FormInput;
