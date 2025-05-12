import React, { useState } from 'react';

const API_BASE = "https://s3-upload.ik39-10vevic.workers.dev"; // ← 本番用Cloudflare WorkerのURL
const PART_SIZE = 10 * 1024 * 1024; // 10MB

const Uploader = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('🔄 アップロード開始...');
    setProgress(0);

    try {
      // STEP 1: マルチパート開始
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

        // STEP 2: 各パートの署名付きURL取得
        const res2 = await fetch(`${API_BASE}/part`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uploadId, partNumber }),
        });

        const { signedUrl } = await res2.json();

        // STEP 3: 各パートアップロード
        const putRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blobPart,
        });

        const eTag = putRes.headers.get('ETag');
        parts.push({ ETag: eTag.replaceAll('"', ''), PartNumber: partNumber });
        setProgress(Math.round((partNumber / partCount) * 100));
      }

      // STEP 4: アップロード完了通知
      const res3 = await fetch(`${API_BASE}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const result = await res3.json();
      console.log('✅ Upload completed:', result);
      setStatus('✅ アップロード完了！');
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('❌ アップロード失敗');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <label className="block mb-2 font-semibold">マルチパートアップローダー</label>
      <input type="file" onChange={handleFileChange} />
      <div className="mt-2">進捗: {progress}%</div>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
};

export default Uploader;




