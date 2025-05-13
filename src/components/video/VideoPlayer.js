import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const videoUrl = video?.key ? getVideoPlaybackUrl(video.key) : null;

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const videoElement = videoRef.current;
    let hls;

    if (Hls.isSupported() && videoUrl.endsWith('.m3u8')) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error', data);
      });
    } else {
      videoElement.src = videoUrl;
    }

    return () => {
      if (hls) hls.destroy();
      else videoElement.src = '';
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
        className="w-full rounded-xl shadow-md"
      />
    </div>
  );
};

export default VideoPlayer;


