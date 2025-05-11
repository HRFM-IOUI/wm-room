// src/components/common/TabSwitcher.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { key: 'videos', label: '動画', badge: 'おすすめ', badgeStyle: 'balloon' },
  { key: 'goods', label: 'グッズ' },
  { key: 'gacha', label: 'まもなく公開', badge: 'まもなく公開', badgeStyle: 'pulse' },
];

const TabSwitcher = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDmode = location.pathname.startsWith('/dmode');

  const handleTabClick = (key) => {
    setActiveTab(key);
    if (isDmode) {
      navigate(`/dmode?tab=${key}`);
    } else {
      navigate(`/toppage?tab=${key}`);
    }
  };

  return (
    <div className="flex justify-around border-b border-gray-300 bg-white sticky top-0 z-10">
      {tabs.map((tab) => (
        <div key={tab.key} className="relative flex-1">
          <button
            onClick={() => handleTabClick(tab.key)}
            className={`w-full py-3 text-center font-semibold text-sm hover:bg-gray-100 transition-all duration-150 ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>

          {tab.badge && (
            <div
              className={`absolute -top-3 right-4 text-xs font-bold ${
                tab.badgeStyle === 'pulse'
                  ? 'text-red-600 animate-ping-swap'
                  : 'text-blue-500 animate-balloon'
              }`}
            >
              {tab.badge}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabSwitcher;