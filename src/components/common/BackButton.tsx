// src/components/common/BackButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string | number;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = -1, label = '戻る' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof to === 'number') {
      navigate(to); // Go back/forward n steps
    } else if (typeof to === 'string') {
      navigate(to); // Navigate to a path
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-pink-600 hover:underline mt-8"
    >
      {label}
    </button>
  );
};

export default BackButton;



