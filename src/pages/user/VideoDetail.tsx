import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import ShakaPlayerComponent from '../../components/video/ShakaPlayerComponent';
import DownloadButton from '../../components/video/DownloadButton';
import { isVipUser, hasPurchasedVideo } from '../../utils/videoUtils';

interface VideoData {
  id: string;
  title: string;
  key: string;
  type: 'sample' | 'main' | 'dmode';
  [key: string]: any;
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState({ isVip: false, hasPurchased: false });

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const ref = doc(db, 'videos', id!);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          console.warn("❌ Firestore: 該当動画が存在しません");
          setVideo(null);
          setLoading(false);
          return;
        }

        const raw = snap.data();
        if (!raw || typeof raw.key !== 'string' || typeof raw.type !== 'string') {
          console.warn("❌ Firestore: データ構造不正", raw);
          setVideo(null);
          setLoading(false);
          return;
        }

        const data = { id: snap.id, ...raw } as VideoData;
        setVideo(data);

        const user = auth.currentUser;
        if (!user) {
          setAccessGranted(data.type === 'sample');
        } else {
          const [vip, purchased] = await Promise.all([
            isVipUser(),
            hasPurchasedVideo(data.id),
          ]);
          setUserStatus({ isVip: vip, hasPurchased: purchased });

          const canAccess =
            data.type === 'sample' ||
            (data.type === 'main' && (vip || purchased)) ||
            (data.type === 'dmode' && purchased);

          setAccessGranted(canAccess);
        }

        if (accessGranted) {
          const pathParts = data.key.replace(/^videos\//, "").replace(/\.[^/.]+$/, "");
          const apiRes = await fetch("https://cf-worker-upload.ik39-10vevic.workers.dev/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `converted/${pathParts}/playlist.m3u8` }),
          });

          const apiData = await apiRes.json();
          if (apiData.signedUrl) {
            setSignedUrl(apiData.signedUrl);
          } else {
            console.error("❌ 署名付きURLの取得に失敗:", apiData);
          }
        }

      } catch (err) {
        console.error('🔥 動画取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, accessGranted]);

  if (loading) return <p className="p-4">読み込み中...</p>;
  if (!video) return <p className="p-4 text-red-500">動画が見つかりませんでした。</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{video.title}</h1>

      {accessGranted ? (
        <>
          {signedUrl ? (
            <ShakaPlayerComponent manifestUrl={signedUrl} />
          ) : (
            <p className="text-center">署名付きURLを取得中...</p>
          )}
          <DownloadButton video={video} />
        </>
      ) : (
        <div className="bg-red-50 text-red-700 p-4 rounded space-y-4">
          {/* 以下省略、既存の accessDenied 表示ロジックそのまま */}
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
