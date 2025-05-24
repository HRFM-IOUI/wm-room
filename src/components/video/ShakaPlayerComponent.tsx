import React, { useEffect, useRef, useState } from "react";

// ShakaPlayer を直接 import しないことで TS2306 を回避
let shaka: any;
if (typeof window !== "undefined") {
  shaka = require("shaka-player/dist/shaka-player.compiled.js");
}

interface ShakaPlayerProps {
  manifestUrl: string;
}

const ShakaPlayerComponent: React.FC<ShakaPlayerProps> = ({ manifestUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shakaLoaded, setShakaLoaded] = useState(false);

  useEffect(() => {
    let player: any;

    const initShaka = async () => {
      const video = videoRef.current;
      if (!video || !manifestUrl || !shaka) return;

      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        console.error("❌ このブラウザは Shaka Player をサポートしていません");
        return;
      }

      player = new shaka.Player(video);

      // 不要な Authorization ヘッダーを除去
      player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
        if (request.headers) {
          delete request.headers['Authorization'];
          delete request.headers['x-amz-security-token'];
          delete request.headers['x-amz-date'];
          delete request.headers['x-amz-content-sha256'];
        }
      });

      player.addEventListener("error", (event: any) => {
        console.error("Shaka Player エラー:", event.detail);
      });

      try {
        await player.load(manifestUrl);
        console.log("✅ 再生準備完了:", manifestUrl);
        video.play().catch((err: any) => {
          console.warn("⚠️ 自動再生に失敗:", err);
        });
      } catch (err) {
        console.error("❌ マニフェスト読み込み失敗:", err);
      }

      setShakaLoaded(true);
    };

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
        style={{ maxHeight: "70vh" }}
      />
      {!shakaLoaded && <div className="text-center py-2">Loading player...</div>}
    </div>
  );
};

export default ShakaPlayerComponent;
