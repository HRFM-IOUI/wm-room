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
      } catch (err) {
        console.error('🔥 動画取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) return <p className="p-4">読み込み中...</p>;
  if (!video) return <p className="p-4 text-red-500">動画が見つかりませんでした。</p>;

  // CloudFront 再生パスを組み立て
  const pathParts = video.key.replace(/^videos\//, "").replace(/\.[^/.]+$/, "");
  const cloudfrontPath = `converted/${pathParts}/playlist.m3u8`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{video.title}</h1>

      {accessGranted ? (
        <>
          <ShakaPlayerComponent manifestUrl={cloudfrontPath} />
          <DownloadButton video={video} />
        </>
      ) : (
        <div className="bg-red-50 text-red-700 p-4 rounded space-y-4">
          {video.type === 'main' && (
            <div>
              <p className="mb-2">この動画はVIP会員 または 単品購入者専用です。</p>
              <div className="flex gap-4">
                <Link to="/subscribe" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
                  月額会員に加入する
                </Link>
                <Link to={`/purchase/${id}`} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                  単品購入する
                </Link>
              </div>
            </div>
          )}

          {video.type === 'dmode' && (
            <div>
              <p className="mb-2">この動画はディレクターモードで、単品購入が必要です。</p>
              {userStatus.hasPurchased ? (
                <p>✅ 購入済みですが再生できない場合はサポートへご連絡ください。</p>
              ) : (
                <Link to={`/purchase/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  単品購入する
                </Link>
              )}
            </div>
          )}

          {video.type === 'sample' && (
            <p>この動画は無料会員登録後に再生できます。</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
