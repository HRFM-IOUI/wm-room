import React, { ReactNode } from "react";

type FormLabelProps = {
  htmlFor: string;
  children: ReactNode;
};

const FormLabel: React.FC<FormLabelProps> = ({ htmlFor, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-gray-700 mb-1"
    >
      {children}
    </label>
  );
};

export default FormLabel;
