// src/components/video/DownloadButton.tsx
import React from 'react';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

interface DownloadButtonProps {
  video: {
    key: string;
    title?: string;
  };
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ video }) => {
  const downloadUrl = getVideoPlaybackUrl(video.key, 'mp4');

  if (!downloadUrl) return null;

  return (
    <div className="mt-4">
      <a
        href={downloadUrl}
        download
        className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        ダウンロード
      </a>
    </div>
  );
};

export default DownloadButton;

