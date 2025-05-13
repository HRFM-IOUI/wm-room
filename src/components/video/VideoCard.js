import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getVideoPlaybackUrl } from "../../utils/videoUtils";

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoUrl = getVideoPlaybackUrl(video.key);

  return (
    <div
      className="rounded overflow-hidden shadow bg-white transform transition-transform hover:scale-105 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        {isHovered ? (
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

        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
          <button className="bg-white text-black px-4 py-2 rounded-full shadow-md text-sm font-semibold">
            再生
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-gray-500 text-sm mt-1">カテゴリ: {video.category || "未設定"}</p>
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

