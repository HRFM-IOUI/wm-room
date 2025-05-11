// ✅ 修正ポイント：CommonButton のスタイルが他コンポーネントに影響を与えている可能性あり
// Googleログインボタンの見た目が変わった件から、スタイルのスコープ衝突を回避しつつ、Login/Signup ボタンだけに限定スタイルを適用します

// 修正済み: src/components/ui/CommonButton.js
import React from "react";

const CommonButton = ({
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "default", // ← new: variant prop 追加
  ...props
}) => {
  // ボタンスタイルを variant に応じて切り替える
  const baseStyle =
    "font-semibold px-4 py-2 rounded transition shadow disabled:bg-gray-300 disabled:cursor-not-allowed";

  const variantStyle = {
    default: "bg-theme-pink text-white hover:bg-theme-pink-dark",
    white: "bg-white text-gray-800 hover:bg-gray-100 border",
  }[variant];

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