// src/components/video/VideoPlayer.js
import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
    }
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
