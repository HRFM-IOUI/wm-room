import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import VideoPlayer from '../../components/video/VideoPlayer';
import Uploader from '../../components/video/Uploader';
import { format } from 'date-fns';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVideos = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setVideos(list);
  };

  const handleDelete = async (video) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'videos', video.id));
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const togglePublic = async (video) => {
    try {
      const ref = doc(db, 'videos', video.id);
      await updateDoc(ref, { isPublic: !video.isPublic });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, isPublic: !video.isPublic } : v
        )
      );
    } catch (err) {
      console.error(err);
      alert('更新に失敗しました');
    }
  };

  const filteredVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">🎥 マイ動画管理</h1>

      <input
        type="text"
        placeholder="動画タイトルで検索"
        className="border border-gray-300 p-2 w-full rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Uploader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.length === 0 ? (
          <p>動画が見つかりません。</p>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="relative group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9">
                <VideoPlayer video={video} />
              </div>

              <div className="p-4 space-y-1">
                <p className="text-sm text-gray-500">
                  投稿日:{" "}
                  {video.createdAt?.toDate
                    ? format(video.createdAt.toDate(), "yyyy/MM/dd HH:mm")
                    : "不明"}
                </p>
                <h2 className="font-semibold text-lg line-clamp-2">{video.title}</h2>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => togglePublic(video)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      video.isPublic
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {video.isPublic ? '公開中' : '非公開'}
                  </button>

                  <button
                    onClick={() => handleDelete(video)}
                    className="ml-auto text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;




