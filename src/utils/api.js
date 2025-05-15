// ✅ utils/api.js

export const requestVideoConversion = async (key) => {
  const res = await fetch("https://cf-worker-upload.ik39-10vevic.workers.dev/convert-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  const data = await res.json();

  if (!res.ok || !data.outputPath) {
    throw new Error(data.error || "変換ジョブ作成に失敗しました");
  }

  return data.outputPath; // 例: "converted/abc123/playlist.m3u8"
};
