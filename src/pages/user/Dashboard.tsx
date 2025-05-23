import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import ShakaPlayerComponent from "../../components/video/ShakaPlayerComponent";
import { getVideoPlaybackUrl } from "../../utils/videoUtils";
import Uploader from "../../components/video/Uploader";

type VideoData = {
  id: string;
  title: string;
  key: string;
  isPublic: boolean;
  [key: string]: any;
};

const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchVideos = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "videos"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const videoList = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VideoData[];
    setVideos(videoList);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (video: VideoData) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "videos", video.id));
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  const togglePublic = async (video: VideoData) => {
    try {
      const ref = doc(db, "videos", video.id);
      await updateDoc(ref, { isPublic: !video.isPublic });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, isPublic: !video.isPublic } : v
        )
      );
    } catch (err) {
      console.error(err);
      alert("公開状態の更新に失敗しました");
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">マイ動画管理</h1>

      <input
        type="text"
        placeholder="動画タイトルで検索"
        className="border p-2 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Uploader />

      <div className="grid gap-4">
        {filteredVideos.length === 0 ? (
          <p>動画が見つかりません。</p>
        ) : (
          filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={handleDelete}
              onTogglePublic={togglePublic}
            />
          ))
        )}
      </div>
    </div>
  );
};

const VideoCard: React.FC<{
  video: VideoData;
  onDelete: (video: VideoData) => void;
  onTogglePublic: (video: VideoData) => void;
}> = ({ video, onDelete, onTogglePublic }) => {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!video?.key) {
        console.warn("⚠️ video.key が未定義のため再生スキップ", video);
        return;
      }

      try {
        const url = await getVideoPlaybackUrl(video.key, "hls");
        setPlaybackUrl(url);
      } catch (err) {
        console.error("再生URL取得エラー:", err);
      }
    };
    fetchUrl();
  }, [video.key]);

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white space-y-2">
      <p className="font-semibold">{video.title}</p>
      {playbackUrl ? (
        <ShakaPlayerComponent manifestUrl={playbackUrl} />
      ) : (
        <p className="text-gray-400">再生URL取得中...</p>
      )}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() => onTogglePublic(video)}
          className={`px-3 py-1 rounded ${
            video.isPublic ? "bg-green-500" : "bg-gray-400"
          } text-white`}
        >
          {video.isPublic ? "公開中" : "非公開"}
        </button>
        <button
          onClick={() => onDelete(video)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
