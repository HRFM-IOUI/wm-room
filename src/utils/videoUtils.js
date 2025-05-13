// src/utils/videoUtils.js
import { auth, db } from '../firebase';
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// VIP判定
export const isVipUser = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() && snap.data().vip === true;
};

// 購入判定
export const hasPurchasedVideo = async (videoId) => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'purchases', `${user.uid}_${videoId}`));
  return snap.exists();
};

// ✅ アップロード完了後にFirestoreへ登録
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
