import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getVideoPlaybackUrl, isVipUser, hasPurchasedVideo } from "../../utils/videoUtils";

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [badge, setBadge] = useState("確認中");

  useEffect(() => {
    const checkAccess = async () => {
      if (!video?.key) {
        setBadge("非公開");
        return;
      }

      if (video.type === "sample") {
        setCanAccess(true);
        setBadge("サンプル");
        return;
      }

      const [vip, purchased] = await Promise.all([
        isVipUser(),
        hasPurchasedVideo(video.id),
      ]);

      if (video.type === "main") {
        if (vip || purchased) {
          setCanAccess(true);
          setBadge("視聴可能");
        } else {
          setCanAccess(false);
          setBadge("VIP限定");
        }
      } else if (video.type === "dmode") {
        if (purchased) {
          setCanAccess(true);
          setBadge("購入済");
        } else {
          setCanAccess(false);
          setBadge("単品購入");
        }
      }
    };

    checkAccess();
  }, [video]);

  const validKey = video?.key && typeof video.key === 'string' && video.key.trim() !== '';
  const videoUrl = canAccess && validKey ? getVideoPlaybackUrl(video.key) : null;

  return (
    <div
      className="rounded overflow-hidden shadow bg-white transform transition-transform hover:scale-105 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-w-16 aspect-h-9">
        {isHovered && videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            title={video.title}
          />
        ) : (
          <img
            src="/thumbnail_placeholder.png"
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}

        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
          {badge}
        </span>

        {canAccess && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
            <Link to={`/video/${video.id}`}>
              <button className="bg-white text-black px-4 py-2 rounded-full shadow-md text-sm font-semibold">
                再生
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-gray-500 text-sm mt-1">カテゴリ: {video.category || "未設定"}</p>
        <div className="mt-2 flex gap-2 text-xs text-gray-600">
          {video.tags?.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <Link
          to={`/video/${video.id}`}
          className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
};

export default VideoCard;






