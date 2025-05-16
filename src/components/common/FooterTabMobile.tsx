import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlaySquare, Package, Gift, LucideIcon } from 'lucide-react';

// タブキーの型
type TabKey = 'videos' | 'goods' | 'gacha';

// Props型
type FooterTabMobileProps = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

// タブ定義型
type Tab = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
};

const FooterTabMobile: React.FC<FooterTabMobileProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDmode = location.pathname.startsWith('/dmode');
  const tabs: Tab[] = [
    { key: 'videos', label: isDmode ? 'D-mode' : 'メディア', icon: PlaySquare },
    { key: 'goods', label: 'グッズ', icon: Package },
    { key: 'gacha', label: 'ガチャ', icon: Gift },
  ];

  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key);
    const path = isDmode ? `/dmode?tab=${key}` : `/toppage?tab=${key}`;
    navigate(path);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 border-t backdrop-blur-md transition-all duration-300 ${
        isScrolling ? 'bg-white/60 shadow-sm' : 'bg-white/90 shadow-md'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`flex flex-col items-center justify-center text-xs font-semibold transition-all duration-200 ${
              isActive ? 'text-pink-600 font-bold' : 'text-gray-400'
            } hover:scale-105 active:scale-95`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default FooterTabMobile;

