import React, { useState } from 'react';
import { registerUploadedVideo } from '../../utils/videoUtils';

const API_BASE = "https://cf-worker-upload.ik39-10vevic.workers.dev";
const PART_SIZE = 10 * 1024 * 1024; // 10MB

const Uploader = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('🔄 アップロード中');
    setProgress(0);

    try {
      // 1. initiate
      const initiateRes = await fetch(`${API_BASE}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const { uploadId, key } = await initiateRes.json();
      if (!uploadId || !key) throw new Error('uploadId または key が取得できません');

      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts = [];

      for (let partNumber = 1; partNumber <= partCount; partNumber++) {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const blobPart = file.slice(start, end);

        const partRes = await fetch(`${API_BASE}/part`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            uploadId,
            partNumber,
          }),
        });

        const { signedUrl } = await partRes.json();
        if (!signedUrl) throw new Error('signedUrlが取得できません');

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blobPart,
          headers: {
            'Content-Type': file.type, // ←追加
          },
        });

        if (!uploadRes.ok) {
          throw new Error(`part ${partNumber} のアップロード失敗 (${uploadRes.status})`);
        }

        const eTag = uploadRes.headers.get('ETag');
        if (!eTag) throw new Error(`ETagが取得できません（part ${partNumber}）`);

        parts.push({ ETag: eTag.replaceAll('"', ''), PartNumber: partNumber });
        setProgress(Math.round((partNumber / partCount) * 100));
      }

      // 3. complete
      const completeRes = await fetch(`${API_BASE}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const result = await completeRes.json();
      if (!completeRes.ok) throw new Error(result.error || 'アップロード完了失敗');
      console.log('✅ Upload completed:', result);
      setStatus('✅ アップロード完了！');

      // 4. Firestoreに登録
      await registerUploadedVideo({
        title: file.name,
        key,
        fileType: file.type,
      });
      console.log('📥 Firestore 登録完了');

    } catch (err) {
      console.error('❌ Upload error:', err);
      setStatus('❌ アップロード失敗');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <label htmlFor="fileUpload" className="block mb-2 font-semibold">
        マルチパートアップローダー
      </label>
      <input
        id="fileUpload"
        type="file"
        onChange={handleFileChange}
        title="動画ファイルを選択してください"
        placeholder="ファイルを選択"
      />
      <div className="mt-2">進捗: {progress}%</div>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
};

export default Uploader;












