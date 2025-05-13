import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import VideoPlayer from '../../components/video/VideoPlayer';
import { isVipUser, hasPurchasedVideo } from '../../utils/videoUtils';

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState({ isVip: false, hasPurchased: false });

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, 'videos', id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setVideo(data);

          const vip = await isVipUser();
          const purchased = await hasPurchasedVideo(id);
          setUserStatus({ isVip: vip, hasPurchased: purchased });

          const canAccess =
            data.type === 'sample' ||
            (data.type === 'main' && vip) ||
            (data.type === 'dmode' && purchased);

          setAccessGranted(canAccess);
        }
      } catch (error) {
        console.error('動画取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) return <p className="p-4">読み込み中...</p>;
  if (!video) return <p className="p-4">動画が見つかりません。</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{video.title}</h1>

      {accessGranted ? (
        <VideoPlayer video={video} />
      ) : (
        <div className="space-y-4">
          {video.type === 'main' && (
            <div>
              <p>この動画はVIP会員専用です。</p>
              <Link
                to="/subscribe"
                className="inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              >
                月額会員に加入する
              </Link>
            </div>
          )}
          {video.type === 'dmode' && (
            <div>
              <p>この動画は単品購入が必要です。</p>
              {userStatus.hasPurchased ? (
                <p>購入済みですが再生できない場合はサポートにご連絡ください。</p>
              ) : (
                <Link
                  to={`/purchase/${id}`}
                  className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  単品購入する
                </Link>
              )}
            </div>
          )}
          {video.type === 'sample' && <p>この動画はログイン後に再生できます。</p>}
        </div>
      )}
    </div>
  );
};

export default VideoDetail;

