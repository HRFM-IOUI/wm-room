// src/utils/videoUtils.ts
import { auth, db } from '../firebase';
import {
  getDoc,
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { getUserVipStatus } from './vipUtils';

export const getVideoPlaybackUrl = (key: string, format: 'hls' | 'mp4' = 'hls'): string | null => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN;
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  const formattedKey =
    format === 'hls' ? `${key}/index.m3u8` : key;

  const fullUrl = `https://${CLOUDFRONT_DOMAIN}/${formattedKey}`;
  console.log('✅ 再生URL生成:', fullUrl);
  return fullUrl;
};

export const isVipUser = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const vipStatus = await getUserVipStatus(user.uid);
  return vipStatus.rank === 'VIP12';
};

export const hasPurchasedVideo = async (videoId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, 'purchases', `${user.uid}_${videoId}`));
  return snap.exists();
};

interface RegisterVideoParams {
  title: string;
  key: string;
  fileType: string;
  category?: string;
  tags?: string[];
}

export const registerUploadedVideo = async ({
  title,
  key,
  fileType,
  category = 'その他',
  tags = [],
}: RegisterVideoParams) => {
  const user = auth.currentUser;
  if (!user) throw new Error('ログインが必要です');

  const videosRef = collection(db, 'videos');
  const newDoc = await addDoc(videosRef, {
    title,
    key,
    fileType,
    category,
    tags,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: 'public',
  });

  return newDoc;
};

export const saveConvertedVideoUrl = async (videoId: string, outputPath: string) => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN;
  const playbackUrl = `https://${CLOUDFRONT_DOMAIN}/${outputPath}`;
  await updateDoc(doc(db, 'videos', videoId), {
    playbackUrl,
    status: 'converted',
  });
};




