// src/components/video/Uploader.js
import React, { useState } from 'react';

const API_BASE = "https://s3-upload.ik39-10vevic.workers.dev";
const PART_SIZE = 10 * 1024 * 1024; // 10MB

const Uploader = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setProgress(0);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      alert("ファイルを選択してください");
      return;
    }

    setUploading(true);
    setStatus('🔄 アップロード開始...');
    setProgress(0);

    try {
      const res1 = await fetch(`${API_BASE}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, type: file.type }),
      });

      const { uploadId, key } = await res1.json();
      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts = [];

      for (let partNumber = 1; partNumber <= partCount; partNumber++) {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const blobPart = file.slice(start, end);

        const res2 = await fetch(`${API_BASE}/part`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, partNumber }),
        });

        const { signedUrl } = await res2.json();

        const putRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blobPart,
        });

        const eTag = putRes.headers.get('ETag');
        parts.push({ ETag: eTag.replaceAll('"', ''), PartNumber: partNumber });

        setProgress(Math.round((partNumber / partCount) * 100));
      }

      const res3 = await fetch(`${API_BASE}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const result = await res3.json();
      const videoUrl = `https://${process.env.REACT_APP_CLOUDFRONT_DOMAIN}/${key}`;
      console.log('✅ Upload completed:', result);

      setStatus('✅ アップロード完了！');
      if (onComplete) onComplete(videoUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('❌ アップロード失敗');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white space-y-3">
      <label className="block font-semibold">動画ファイル選択</label>
      <input type="file" onChange={handleFileSelect} />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
      >
        {uploading ? "アップロード中..." : "アップロード"}
      </button>
      <div className="text-sm text-gray-600">進捗: {progress}%</div>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
};

export default Uploader;





