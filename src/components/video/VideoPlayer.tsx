// src/components/video/VideoPlayer.tsx
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

type VideoData = {
  key?: string;
  playbackUrl?: string; // 署名付きURLをCloudflare Worker等で返す場合に利用
};

type VideoPlayerProps = {
  video: VideoData;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ 優先順位：1. playbackUrl（署名済URL） > 2. keyから生成
  const videoUrl =
    video?.playbackUrl ?? (video?.key ? getVideoPlaybackUrl(video.key, 'hls') : undefined);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoUrl || !videoElement) return;

    let hls: Hls | null = null;
    const isHls = videoUrl.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS.js error:', data);
      });
    } else if (isHls && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoUrl;
    } else {
      console.warn('このブラウザはHLS再生に非対応です。');
    }

    return () => {
      if (hls) {
        hls.destroy();
      } else if (videoElement) {
        videoElement.removeAttribute('src');
      }
    };
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="text-center text-sm text-gray-500 py-6">
        ⚠️ 再生用URLが未設定です。変換中または未登録です。
      </div>
    );
  }

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        controls
        muted
        playsInline
        className="w-full rounded-xl shadow-md"
        style={{ maxHeight: '70vh' }}
      />
    </div>
  );
};

export default VideoPlayer;
