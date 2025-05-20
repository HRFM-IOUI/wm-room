/**
 * ✅ Cloudflare Worker 経由で動画変換をリクエスト
 * @param key アップロードされた動画のキー（S3パス相当）
 * @returns 署名付き再生URL（CloudFront経由）
 */
export const requestVideoConversion = async (key: string): Promise<string> => {
  const res = await fetch(
    "https://cf-worker-upload-production.ik39-10vevic.workers.dev/convert-video",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }
  );

  const data: {
    jobId?: string;
    outputPath?: string;
    playbackUrl?: string;
    error?: string;
  } = await res.json();

  if (!res.ok || !data.playbackUrl) {
    throw new Error(data.error || "変換ジョブ作成に失敗しました");
  }

  return data.playbackUrl;
};
