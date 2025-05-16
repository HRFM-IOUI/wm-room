import React, { useEffect, useRef, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import SidebarLeft from "../../components/common/SidebarLeft";
import SidebarRight from "../../components/common/SidebarRight";
import MenuPanel from "../../components/common/MenuPanel";
import FooterTabMobile from "../../components/common/FooterTabMobile";
import TabSwitcher from "../../components/common/TabSwitcher";
import VideoCard from "../../components/video/VideoCard";
import { getUserVipStatus } from "../../utils/vipUtils";
import { useMediaQuery } from "react-responsive";

type VideoData = {
  id: string;
  key: string;
  title?: string;
  category?: string;
  type?: string;
  tags?: string[];
  isPublic?: boolean;
  [key: string]: any;
};

type VipStatus = {
  rank: string;
  streak: number;
  points: number;
};

const DmodePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [vipStatus, setVipStatus] = useState<VipStatus | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [visibleVideos, setVisibleVideos] = useState<VideoData[]>([]);
  const [activeTab, setActiveTab] = useState<"videos" | "goods" | "gacha">("videos");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    const fetchVip = async () => {
      if (user) {
        const vs = await getUserVipStatus(user.uid);
        setVipStatus(vs as VipStatus); // ✅ 型アサーション追加でエラー回避
      }
    };
    fetchVip();
  }, [user]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      const q = query(
        collection(db, "videos"),
        where("type", "==", "dmode"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoData[];
      setVideos(list);
      setVisibleVideos(list.slice(0, 6));
    };
    fetchVideos();
  }, [user]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleVideos((prev) => [
          ...prev,
          ...videos.slice(prev.length, prev.length + 6),
        ]);
      }
    });
    if (lastRef.current) observer.current.observe(lastRef.current);
  }, [visibleVideos, videos]);

  const renderTabContent = () => {
    if (activeTab === "videos") {
      if (!vipStatus || vipStatus.rank !== "VIP12") {
        return <p className="text-center p-6 text-red-600">VIPランクが必要です。</p>;
      }

      if (visibleVideos.length === 0) {
        return <p className="text-center p-6 text-gray-500">動画がありません。</p>;
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleVideos.map((video, i) => (
            <div key={video.id} ref={i === visibleVideos.length - 1 ? lastRef : null}>
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="text-center text-gray-500 p-6">
          このセクションは準備中です。
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <div className="flex flex-1">
        <aside className="hidden md:block md:w-1/5 bg-white p-4 h-screen sticky top-0">
          <SidebarLeft />
        </aside>

        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-[64px] space-y-4">
          {vipStatus && (
            <div className="bg-pink-100 text-black p-4 rounded-xl shadow text-sm">
              🎖️ VIPランク: <strong>{vipStatus.rank}</strong> / ログイン連続: {vipStatus.streak}日 / ポイント: {vipStatus.points}pt
            </div>
          )}
          <MenuPanel isDmode={true} /> {/* ✅ props定義追加済み前提 */}
          {isDesktop && (
            <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
          {renderTabContent()}
        </main>

        <aside className="hidden lg:block lg:w-1/5 bg-white p-4 h-screen sticky top-0">
          <SidebarRight
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onTagSelect={setSelectedTag}
          />
        </aside>
      </div>

      {isMobile && (
        <FooterTabMobile activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

export default DmodePage;




