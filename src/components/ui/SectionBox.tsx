import React, { ReactNode } from "react";

type SectionBoxProps = {
  children: ReactNode;
  className?: string;
};

const SectionBox: React.FC<SectionBoxProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-soft rounded px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export default SectionBox;
