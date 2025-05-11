// src/components/ui/SectionBox.js
import React from "react";

const SectionBox = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-soft rounded px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export default SectionBox;