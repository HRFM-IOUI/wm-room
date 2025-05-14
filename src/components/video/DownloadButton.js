import React, { useEffect, useState } from "react";
import { isVipUser, hasPurchasedVideo, getVideoPlaybackUrl } from "../../utils/videoUtils";

const DownloadButton = ({ video }) => {
  const [canDownload, setCanDownload] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const [vip, purchased] = await Promise.all([
          isVipUser(),
          hasPurchasedVideo(video.id),
        ]);
        setCanDownload(vip || purchased);
      } catch (err) {
        console.error("ダウンロード判定エラー:", err);
        setCanDownload(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [video.id]);

  if (checking) return null;

  return (
    <div className="mt-4 text-center">
      {canDownload ? (
        <a
          href={getVideoPlaybackUrl(video.key)} // ✅ 後で署名付きDL URLに差し替え可
          download
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-block"
        >
          🎬 ダウンロードする
        </a>
      ) : (
        <p className="text-sm text-gray-400">※ダウンロードはVIP会員または購入済ユーザーのみ可能です</p>
      )}
    </div>
  );
};

export default DownloadButton;
