// src/components/ui/FormLabel.js
import React from "react";

const FormLabel = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 mb-1">
      {children}
    </label>
  );
};

export default FormLabel;