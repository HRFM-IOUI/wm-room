import React, { useState, ChangeEvent } from "react";
import { registerUploadedVideo } from "../../utils/videoUtils";
import { requestVideoConversion } from "../../utils/api";

const API_BASE = "https://cf-worker-upload.ik39-10vevic.workers.dev";
const PART_SIZE = 10 * 1024 * 1024;
const CATEGORIES: string[] = ["その他"];

const Uploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("その他");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus("アップロード中...");
    setProgress(0);

    try {
      const videoId = crypto.randomUUID();
      const key = `videos/${videoId}/${file.name}`;

      const resInit = await fetch(`${API_BASE}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, videoId, key }),
      });

      if (!resInit.ok) {
        const text = await resInit.text();
        throw new Error(`初期化APIエラー: ${text}`);
      }

      const { uploadId } = await resInit.json();
      if (!uploadId) throw new Error("初期化エラー: uploadId未取得");

      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts: { ETag: string; PartNumber: number }[] = [];

      for (let partNumber = 1; partNumber <= partCount; partNumber++) {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const blob = file.slice(start, end);

        const resPart = await fetch(`${API_BASE}/part`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, uploadId, partNumber }),
        });

        if (!resPart.ok) {
          const text = await resPart.text();
          throw new Error(`署名取得失敗（Part ${partNumber}）: ${text}`);
        }

        const { signedUrl } = await resPart.json();

        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: blob,
          mode: "cors",
        });

        if (!uploadRes.ok) {
          throw new Error(`S3アップロード失敗（Part ${partNumber}）`);
        }

        const eTag = uploadRes.headers.get("ETag");
        if (!eTag) throw new Error(`ETagが取得できません（Part ${partNumber}）`);

        parts.push({ ETag: eTag.replaceAll('"', ""), PartNumber: partNumber });
        setProgress(Math.round((partNumber / partCount) * 100));
      }

      await fetch(`${API_BASE}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const docRef = await registerUploadedVideo({
        title: file.name,
        key,
        fileType: file.type,
        category,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      });

      console.log("📄 Firestore登録:", docRef.id);

      await requestVideoConversion(key);
      setProgress(100);
      setStatus("✅ アップロード＆変換完了！");
      setFile(null);
      setTagsInput("");
    } catch (err: any) {
      console.error("❌ エラー:", err);
      setStatus("❌ アップロード失敗: " + (err?.message || "不明なエラー"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4 border">
      <h2 className="text-lg font-bold text-gray-800">📤 新規動画アップロード</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="w-full p-2 border rounded"
        disabled={isUploading}
      />
      {file && <p className="text-sm text-gray-600 mt-1">🎬 {file.name}</p>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isUploading}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">タグ（カンマ区切り）</label>
        <input
          type="text"
          placeholder="例: Vlog,旅行,猫"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isUploading}
        />
      </div>

      <button
        disabled={!file || isUploading}
        onClick={handleUpload}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold"
      >
        アップロード開始
      </button>

      <div className="text-sm text-gray-700">進捗: {progress}%</div>
      <div
        className={`text-sm font-medium ${
          status.includes("失敗") ? "text-red-600" : "text-green-600"
        }`}
      >
        {status}
      </div>
    </div>
  );
};

export default Uploader;
