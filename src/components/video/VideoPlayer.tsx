import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

interface VideoData {
  key: string;
  [key: string]: any;
}

interface Props {
  video: VideoData;
}

const VideoPlayer: React.FC<Props> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const playbackUrl = getVideoPlaybackUrl(video.key, 'hls');
    console.log('🔍 再生URL:', playbackUrl); // ← 追加済み！

    if (!playbackUrl || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error:', data);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = playbackUrl;
    }
  }, [video.key]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full rounded-xl shadow-md"
      style={{ maxHeight: '70vh' }}
    />
  );
};

export default VideoPlayer;
