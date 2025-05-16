// src/components/video/VideoPlayer.tsx
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

type VideoData = {
  key?: string;
  playbackUrl?: string;
};

type VideoPlayerProps = {
  video: VideoData;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoUrl = video?.playbackUrl ?? getVideoPlaybackUrl(video?.key ?? '') ?? undefined;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoUrl || !videoElement) return;

    let hls: Hls | null = null;
    const isHls = videoUrl.endsWith('.m3u8');

    if (isHls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS.js error:', data);
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoUrl;
    } else {
      console.warn('このブラウザではHLS再生に非対応です。');
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
      <div className="text-center text-gray-500 text-sm py-4">
        ⚠️ 再生する動画データが見つかりません
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







