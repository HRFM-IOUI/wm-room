import { auth, db } from '../firebase';
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { getUserVipStatus } from './vipUtils';

// ✅ 再生URLを生成（HLS形式に対応：デフォルトは.m3u8）
export const getVideoPlaybackUrl = (key, format = 'hls') => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN;
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  const formattedKey =
    format === 'hls'
      ? `${key}/index.m3u8`  // HLS形式（例: videos/abc123/index.m3u8）
      : key;                 // mp4などの場合はそのまま返す

  const fullUrl = `https://${CLOUDFRONT_DOMAIN}/${formattedKey}`;
  console.log("✅ 再生URL生成:", fullUrl);
  return fullUrl;
};

// ✅ VIPユーザーかどうかを判定（rank が VIP12 以上なら true）
export const isVipUser = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const vipStatus = await getUserVipStatus(user.uid);
  return vipStatus.rank === 'VIP12';
};

// ✅ 指定動画を購入済みかどうか判定
export const hasPurchasedVideo = async (videoId) => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'purchases', `${user.uid}_${videoId}`));
  return snap.exists();
};

// ✅ Firestoreに動画アップロード登録（カテゴリ・タグ対応版）
export const registerUploadedVideo = async ({
  title,
  key,
  fileType,
  category = 'その他',
  tags = [],
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('ログインが必要です');

  const videosRef = collection(db, 'videos');

  await addDoc(videosRef, {
    title,
    key,
    fileType,
    category,
    tags,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: 'public',
  });
};


