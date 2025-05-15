import React, { useEffect, useRef } from 'react';

let shaka: any;
if (typeof window !== 'undefined') {
  shaka = require('shaka-player');
}

interface ShakaPlayerProps {
  manifestUrl: string;
}

const ShakaPlayerComponent: React.FC<ShakaPlayerProps> = ({ manifestUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl || !shaka) return;

    const player = new shaka.Player(video);

    player.addEventListener('error', (event: Event) => {
      console.error('Shaka error', event);
    });

    player.load(manifestUrl).catch((err: any) => {
      console.error('Shaka load error', err);
    });

    return () => {
      player.destroy();
    };
  }, [manifestUrl]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full rounded-xl shadow-md"
      style={{ maxHeight: '70vh' }}
    />
  );
};

export default ShakaPlayerComponent;









