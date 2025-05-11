// src/components/common/BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to = -1, label = '戻る' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 text-sm text-pink-600 hover:underline mt-8"
    >
      {label}
    </button>
  );
};

export default BackButton;

