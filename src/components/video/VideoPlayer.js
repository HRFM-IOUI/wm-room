import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getVideoPlaybackUrl } from '../../utils/videoUtils';

const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const videoUrl = getVideoPlaybackUrl(video.key);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const video = videoRef.current;
    let hls;

    if (Hls.isSupported() && videoUrl.endsWith('.m3u8')) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error', data);
      });
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hls) hls.destroy();
      else video.src = '';
    };
  }, [videoUrl]);

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

