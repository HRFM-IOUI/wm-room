// ✅ 修正済み：DownloadButton.tsx
import React, { useEffect, useState } from 'react';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

interface DownloadButtonProps {
  video: {
    key: string;
    title?: string;
  } | null;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ video }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (video?.key) {
        const url = await getVideoPlaybackUrl(video.key, 'mp4');
        setDownloadUrl(url);
      }
    };
    fetchUrl();
  }, [video?.key]);

  if (!downloadUrl) return null;

  return (
    <div className="mt-4">
      <a
        href={downloadUrl}
        download={video?.title || 'video.mp4'}
        className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        ダウンロード
      </a>
    </div>
  );
};
export default DownloadButton;