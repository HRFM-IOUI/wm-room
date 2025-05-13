import { auth, db } from '../firebase';
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// 再生URLを生成（CloudFrontドメインまたはS3バケットパス）
export const getVideoPlaybackUrl = (key) => {
  const CLOUDFRONT_DOMAIN = 'toafans-videos.s3.ap-northeast-1.amazonaws.com'; // 必要に応じて署名付きURL対応可
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
};

export const isVipUser = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() && snap.data().vip === true;
};

export const hasPurchasedVideo = async (videoId) => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'purchases', `${user.uid}_${videoId}`));
  return snap.exists();
};

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
