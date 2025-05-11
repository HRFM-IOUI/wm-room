// src/components/common/MenuPanel.js

import React from "react";
import { useNavigate } from "react-router-dom";

const menus = [
  { label: "マイページ", icon: "🙋‍♀️", path: "/mypage" },
  { label: "D-mode", icon: "🛡️", path: "/dmode" },
];

const MenuPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3">
        {menus.map((menu) => (
          <button
            key={menu.label}
            onClick={() => navigate(menu.path)}
            className="flex flex-col items-center justify-center w-28 h-20 bg-white border rounded-xl shadow hover:bg-gray-50"
          >
            <div className="text-2xl">{menu.icon}</div>
            <div className="text-sm font-medium mt-1">{menu.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuPanel;