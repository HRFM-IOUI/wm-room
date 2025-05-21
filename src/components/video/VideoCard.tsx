import React from "react";
import { Link } from "react-router-dom";

type VideoData = {
  id: string;
  title?: string;
  category?: string;
  tags?: string[];
};

type VideoCardProps = {
  video: VideoData;
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div className="rounded overflow-hidden shadow bg-white transform transition-transform hover:scale-105 hover:shadow-lg">
      {/* サムネイル表示のみ */}
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src="/thumbnail_placeholder.png"
          alt={video.title || "動画サムネイル"}
          className="w-full h-full object-cover"
        />

        {/* 再生ボタン */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
          <Link to={`/video/${video.id}`}>
            <button className="bg-white text-black px-4 py-2 rounded-full shadow-md text-sm font-semibold">
              再生
            </button>
          </Link>
        </div>
      </div>

      {/* メタ情報 */}
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
