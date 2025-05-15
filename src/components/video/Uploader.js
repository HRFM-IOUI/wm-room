// ✅ 修正版 Uploader.js with 正常なETag取得 + エラー回避
import React, { useState } from 'react';
import { registerUploadedVideo, saveConvertedVideoUrl } from '../../utils/videoUtils';
import { requestVideoConversion } from '../../utils/api';

const API_BASE = "https://cf-worker-upload.ik39-10vevic.workers.dev";
const PART_SIZE = 10 * 1024 * 1024;
const CATEGORIES = ["女子高生","合法jk","jk","幼児体型","幼児服","ロリ","未○年","素人","ハメ撮り","個人撮影","色白","細身","巨乳","パイパン","ガキ","メスガキ","お仕置き","レイプ","中出し","コスプレ","制服","学生","華奢","孕ませ","その他"];

const Uploader = () => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("その他");
  const [tagsInput, setTagsInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('アップロード中...');
    setProgress(0);

    try {
      const resInit = await fetch(`${API_BASE}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { uploadId, key } = await resInit.json();
      if (!uploadId || !key) throw new Error('初期化エラー');

      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts = [];

      for (let partNumber = 1; partNumber <= partCount; partNumber++) {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const blob = file.slice(start, end);

        const resPart = await fetch(`${API_BASE}/part`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, partNumber }),
        });

        const { signedUrl } = await resPart.json();
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: blob,
        });

        const eTag = uploadRes.headers.get('ETag');
        if (!eTag) throw new Error(`ETagが取得できませんでした（Part ${partNumber}）`);

        parts.push({ ETag: eTag.replaceAll('"', ''), PartNumber: partNumber });
        setProgress(Math.round((partNumber / partCount) * 100));
      }

      await fetch(`${API_BASE}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const docRef = await registerUploadedVideo({
        title: file.name,
        key,
        fileType: file.type,
        category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      });

      const outputPath = await requestVideoConversion(key);
      await saveConvertedVideoUrl(docRef.id, outputPath);

      setStatus("✅ アップロード＆変換完了！");
      setFile(null);
      setTagsInput('');
    } catch (err) {
      console.error(err);
      setStatus("❌ アップロード失敗: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4 border">
      <h2 className="text-lg font-bold text-gray-800">📤 新規動画アップロード</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
      {file && <p className="text-sm text-gray-600 mt-1">🎬 選択ファイル: {file.name}</p>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">カテゴリ</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded">
          {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">タグ（カンマ区切り）</label>
        <input type="text" placeholder="例: Vlog,旅行,猫" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <button disabled={!file} onClick={handleUpload} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold">
        アップロード開始
      </button>

      <div className="text-sm text-gray-700">進捗: {progress}%</div>
      <div className={`text-sm font-medium ${status.includes("失敗") ? "text-red-600" : "text-green-600"}`}>{status}</div>
    </div>
  );
};

export default Uploader;















