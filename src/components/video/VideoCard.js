import React, { useState } from "react";
import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rounded overflow-hidden shadow bg-white transform transition-transform hover:scale-105 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 動画コンテナ */}
      <div className="aspect-w-16 aspect-h-9 relative">
        {isHovered ? (
          <video
            src={`https://example.com/samples/${video.videoId}.mp4`} // サンプル動画のURL
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            title={video.title}
          />
        ) : (
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${process.env.REACT_APP_BUNNY_LIBRARY_ID}/${video.videoId}`}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={video.title}
          />
        )}
        {/* 再生ボタン */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
          <button className="bg-white text-black px-4 py-2 rounded-full shadow-md text-sm font-semibold">
            再生
          </button>
        </div>
      </div>

      {/* コンテンツ部分 */}
      <div className="p-3">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-gray-500 text-sm mt-1">カテゴリ: {video.category || "未設定"}</p>
        
        {/* カテゴリのアイコン表示 */}
        <div className="mt-2 flex gap-2">
          <span className="text-xs text-gray-600">{video.category}</span>
        </div>

        {/* 詳細リンク */}
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
