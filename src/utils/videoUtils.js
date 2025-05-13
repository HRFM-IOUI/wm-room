import { auth, db } from '../firebase';
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// ✅ CloudFrontまたはS3パスから再生URLを生成
export const getVideoPlaybackUrl = (key) => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN;
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
};

// ✅ VIPユーザーかどうか判定
export const isVipUser = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() && snap.data().vip === true;
};

// ✅ 指定動画を購入済みかどうか判定
export const hasPurchasedVideo = async (videoId) => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'purchases', `${user.uid}_${videoId}`));
  return snap.exists();
};

// ✅ Firestoreに動画アップロード登録
export const registerUploadedVideo = async ({ title, key, fileType }) => {
  const user = auth.currentUser;
  if (!user) throw new Error('ログインが必要です');

  const videosRef = collection(db, 'videos');

  await addDoc(videosRef, {
    title,
    key,
    fileType,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: 'public',
  });
};
