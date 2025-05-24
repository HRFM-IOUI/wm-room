import React, { useEffect, useRef, useState } from "react";

// Shaka Player を動的 import して TS エラー回避
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

      // すべての既存リクエストフィルターをクリア
      player.getNetworkingEngine().clearAllRequestFilters();

      // Authorization ヘッダーを強制的に除外するフィルターを追加
      player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
        if (
          type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
          type === shaka.net.NetworkingEngine.RequestType.SEGMENT
        ) {
          if (request.headers && request.headers['Authorization']) {
            console.log("⚠️ Authorization ヘッダーを削除しました");
            delete request.headers['Authorization'];
          }
        }
      });

      // エラーイベントリスナー
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
