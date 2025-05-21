import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

type VideoData = {
  key?: string;
};

type VideoPlayerProps = {
  video: VideoData;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 署名付きCloudFront URLを生成
  const videoUrl = video?.key ? getVideoPlaybackUrl(video.key, 'hls') : undefined;

  // ✅ 再生URLをログ出力
  useEffect(() => {
    console.log('🎬 再生URL:', videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoUrl || !videoElement) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS.js error:', data);
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoUrl;
    } else {
      console.warn('このブラウザはHLS再生に非対応です。');
    }

    return () => {
      if (hls) {
        hls.destroy();
      } else {
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
