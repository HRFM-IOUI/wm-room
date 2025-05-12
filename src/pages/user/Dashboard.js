// src/pages/dashboard/Dashboard.js
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

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVideos = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const videoList = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setVideos(videoList);
  };

  const handleDelete = async (video) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      // Bunny削除が不要ならこの行をスキップ可能
      // await deleteVideoFromBunny(video.guid);
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

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchVideos();
  }, []);

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
            <div
              key={video.id}
              className="p-4 border rounded-xl shadow-sm bg-white space-y-2"
            >
              <p className="font-semibold">{video.title}</p>
              <VideoPlayer videoUrl={video.videoUrl} />
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => togglePublic(video)}
                  className={`px-3 py-1 rounded ${
                    video.isPublic ? 'bg-green-500' : 'bg-gray-400'
                  } text-white`}
                >
                  {video.isPublic ? '公開中' : '非公開'}
                </button>
                <button
                  onClick={() => handleDelete(video)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
