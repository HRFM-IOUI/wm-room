import React, { useEffect, useRef, useState } from "react";

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

      const netEngine = player.getNetworkingEngine();
      netEngine.clearAllRequestFilters();

      netEngine.registerRequestFilter((type: any, request: any) => {
        if (
          type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
          type === shaka.net.NetworkingEngine.RequestType.SEGMENT
        ) {
          if (request.headers) {
            // AWS 系ヘッダーを完全除去
            delete request.headers['Authorization'];
            delete request.headers['x-amz-date'];
            delete request.headers['x-amz-security-token'];
            delete request.headers['x-amz-content-sha256'];
            delete request.headers['x-amz-source-account'];
            delete request.headers['x-amz-source-arn'];
            console.log("✅ CloudFront用ヘッダーのみ適用 (AWS署名ヘッダー除去)");
          }
        }
      });

      player.addEventListener("error", (event: any) => {
        console.error("Shaka Player エラー:", event.detail);
      });

      try {
        await player.load(manifestUrl);
        console.log("✅ Shaka Player: マニフェスト読み込み成功:", manifestUrl);
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
