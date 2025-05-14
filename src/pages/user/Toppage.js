import React, { useEffect, useRef, useState, useMemo } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import SidebarLeft from "../../components/common/SidebarLeft";
import SidebarRight from "../../components/common/SidebarRight";
import MenuPanel from "../../components/common/MenuPanel";
import FooterTabMobile from "../../components/common/FooterTabMobile";
import TabSwitcher from "../../components/common/TabSwitcher";
import VideoCard from "../../components/video/VideoCard";
import { useMediaQuery } from "react-responsive";

const Toppage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("videos");
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const observer = useRef(null);
  const lastPostRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveTab(tab === "goods" || tab === "gacha" ? tab : "videos");
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetched);
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchTag = !selectedTag || (Array.isArray(post.tags) && post.tags.includes(selectedTag));
      const matchCategory = !selectedCategory || post.category === selectedCategory;
      return post.isPublic !== false && matchTag && matchCategory;
    });
  }, [posts, selectedTag, selectedCategory]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((prev) => prev + 6);
      }
    });
    if (lastPostRef.current) observer.current.observe(lastPostRef.current);
  }, [filteredPosts]);

  const renderTabContent = () => {
    if (activeTab === "videos") {
      const displayed = filteredPosts.slice(0, visibleCount);
      if (displayed.length === 0) {
        return <p className="text-center text-gray-500 py-12">表示する動画がありません。</p>;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayed.map((post, index) => (
            <div key={post.id} ref={index === displayed.length - 1 ? lastPostRef : null}>
              <VideoCard video={post} />
            </div>
          ))}
        </div>
      );
    } else {
      return <p className="text-center text-gray-500 py-12">このコンテンツは現在準備中です。</p>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <div className="flex flex-1">
        <aside className="hidden md:block md:w-1/5 bg-white p-4 h-screen sticky top-0">
          <SidebarLeft />
        </aside>
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-[64px] space-y-4">
          <MenuPanel />
          {isDesktop && <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />}
          {renderTabContent()}
        </main>
        <aside className="hidden lg:block lg:w-1/5 bg-white p-4 h-screen sticky top-0">
          <SidebarRight
            onTagSelect={setSelectedTag}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </aside>
      </div>
      {isMobile && <FooterTabMobile activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default Toppage;







