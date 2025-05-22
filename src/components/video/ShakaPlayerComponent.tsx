import React, { useEffect, useRef, useState } from 'react';

interface ShakaPlayerProps {
  manifestUrl: string;
}

const ShakaPlayerComponent: React.FC<ShakaPlayerProps> = ({ manifestUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shakaLoaded, setShakaLoaded] = useState(false);

  useEffect(() => {
    let player: any;

    async function initShaka() {
      const videoElement = videoRef.current;
      if (!videoElement || !manifestUrl) return;

      const shaka = require('shaka-player/dist/shaka-player.compiled.js');
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        console.error('Shaka Player is not supported in this browser.');
        return;
      }

      player = new shaka.Player(videoElement);

      player.addEventListener('error', (event: any) => {
        console.error('Shaka Player Error:', event.detail);
      });

      try {
        await player.load(manifestUrl);
        console.log('Shaka Player loaded successfully.');
        videoElement.play().catch((err: any) => {
          console.warn('Autoplay failed:', err);
        });
      } catch (error) {
        console.error('Error loading manifest:', error);
      }

      setShakaLoaded(true);
    }

    initShaka();

    return () => {
      if (player) player.destroy();
    };
  }, [manifestUrl]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        className="w-full rounded-xl shadow-md"
        style={{ maxHeight: '70vh' }}
      />
      {!shakaLoaded && <div className="text-center py-2">Loading player...</div>}
    </div>
  );
};

export default ShakaPlayerComponent;
