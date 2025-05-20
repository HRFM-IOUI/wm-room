/**
 * ✅ Cloudflare Worker 経由で動画変換をリクエスト
 * @param key アップロードされた動画のキー（S3パス相当）
 * @returns HLS 変換後の出力パス（例: "converted/abc123/playlist.m3u8"）
 */
export const requestVideoConversion = async (key: string): Promise<string> => {
  const res = await fetch(
    "https://cf-worker-upload-production.ik39-10vevic.workers.dev/convert-video", // ✅ 本番WorkerのURLに
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }
  );

  const data: { outputPath?: string; error?: string } = await res.json();

  if (!res.ok || !data.outputPath) {
    throw new Error(data.error || "変換ジョブ作成に失敗しました");
  }

  return data.outputPath;
};
