// src/components/ui/SidebarLeft.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Gamepad2, LogOut } from "lucide-react"; // ← ✅ Home, Search を削除
import { auth } from "../../../firebase";

const SidebarLeft = () => {
  const location = useLocation();

  const navItems = [
    { path: "/mypage", label: "マイページ", icon: <User size={20} /> },
    { path: "/gacha-select", label: "ガチャ", icon: <Gamepad2 size={20} /> },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 h-screen sticky top-0 p-4 border-r bg-white text-black space-y-4">
      <h1 className="text-2xl font-bold mb-6">Toa Fans Shop</h1>

      <nav className="flex flex-col gap-3">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-all ${
              location.pathname === path ? "bg-gray-100 font-bold" : ""
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={() => auth.signOut()}
        className="mt-auto flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
      >
        <LogOut size={18} />
        <span>ログアウト</span>
      </button>
    </aside>
  );
};

export default SidebarLeft;