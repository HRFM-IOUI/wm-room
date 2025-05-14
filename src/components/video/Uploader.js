import React, { useState } from 'react';
import { registerUploadedVideo } from '../../utils/videoUtils';

const API_BASE = "https://cf-worker-upload.ik39-10vevic.workers.dev";
const PART_SIZE = 10 * 1024 * 1024;

const Uploader = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('その他');
  const [tags, setTags] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('🔄 アップロード中');
    setProgress(0);

    try {
      const initiateRes = await fetch(`${API_BASE}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
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
          body: JSON.stringify({ key, uploadId, partNumber }),
        });

        const { signedUrl } = await partRes.json();
        if (!signedUrl) throw new Error('signedUrlが取得できません');

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blobPart,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          throw new Error(`part ${partNumber} のアップロード失敗`);
        }

        const eTag = uploadRes.headers.get('ETag');
        if (!eTag) throw new Error('ETag が取得できません');
        parts.push({ ETag: eTag.replaceAll('"', ''), PartNumber: partNumber });
        setProgress(Math.round((partNumber / partCount) * 100));
      }

      const completeRes = await fetch(`${API_BASE}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      const result = await completeRes.json();
      if (!completeRes.ok) throw new Error(result.error || 'アップロード完了失敗');
      setStatus('✅ アップロード完了！');

      // 🔽 Firestore 登録
      await registerUploadedVideo({
        title: file.name,
        key,
        fileType: file.type,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      setStatus('📥 Firestore 登録完了');
    } catch (err) {
      console.error('❌ Upload error:', err);
      setStatus('❌ アップロード失敗');
    }
  };

  return (
    <div className="p-4 border rounded shadow space-y-3">
      <label htmlFor="fileUpload" className="block font-semibold mb-1">
        📤 マルチパートアップローダー
      </label>
      <input
        id="fileUpload"
        type="file"
        onChange={handleFileChange}
        className="mb-2"
      />

      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium mb-1">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="AV">AV</option>
          <option value="Vlog">Vlog</option>
          <option value="Tutorial">Tutorial</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* タグ入力 */}
      <div>
        <label className="block text-sm font-medium mt-3 mb-1">タグ（カンマ区切り）</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          placeholder="例: 素人,巨乳,個人撮影"
        />
      </div>

      <div className="mt-2">進捗: {progress}%</div>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
};

export default Uploader;













