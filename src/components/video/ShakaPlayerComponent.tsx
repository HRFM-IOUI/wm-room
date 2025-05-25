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

    // NetworkingEngineフィルタ: AWS認証ヘッダー完全除去＆デバッグ
    const netEngine = player.getNetworkingEngine();
    netEngine.clearAllRequestFilters();

    netEngine.registerRequestFilter((type: any, request: any) => {
      // MANIFEST or SEGMENT リクエストのみ
      if (
        type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
        type === shaka.net.NetworkingEngine.RequestType.SEGMENT
      ) {
        // ヘッダー内容を必ずログ出力（前・後）
        console.log("🟦[before] request.headers", JSON.parse(JSON.stringify(request.headers)));
        // すべてのヘッダーで認証系を消す
        if (request.headers) {
          Object.keys(request.headers).forEach((key) => {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.startsWith("authorization") ||
              lowerKey.startsWith("x-amz") ||
              lowerKey.startsWith("cookie") ||
              lowerKey.startsWith("x-forwarded") ||
              lowerKey.startsWith("referer")
            ) {
              delete request.headers[key];
            }
          });
        }
        // ヘッダー除去後もログ出力
        console.log("🟩[after ] request.headers", JSON.parse(JSON.stringify(request.headers)));
        // URLも必ず確認
        console.log("🟧 request.uris", request.uris);
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
      {!shakaLoaded && (
        <div className="text-center py-2">Loading player...</div>
      )}
    </div>
  );
};

export default ShakaPlayerComponent;
