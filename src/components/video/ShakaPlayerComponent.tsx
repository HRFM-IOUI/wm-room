import React, { useEffect, useRef } from 'react';

let shaka: any;
if (typeof window !== 'undefined') {
  shaka = require('shaka-player/dist/shaka-player.compiled.js');
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

    player.load(manifestUrl)
      .then(() => {
        console.log('Shaka load success, trying to play...');
        video.play().catch((err: any) => {
          console.warn('AutoPlay or manual play failed:', err);
        });
      })
      .catch((err: any) => {
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








