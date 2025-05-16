// src/utils/videoUtils.ts
import { auth, db } from "../firebase";
import {
  getDoc,
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  DocumentReference,
} from "firebase/firestore";
import { getUserVipStatus } from "./vipUtils";

interface VipStatus {
  rank: string;
  points: number;
  gachaCount: number;
  totalSpent: number;
  [key: string]: any;
}

interface RegisterVideoParams {
  title: string;
  key: string;
  fileType: string;
  category?: string;
  tags?: string[];
}

/**
 * HLS または MP4 再生用の署名付きURLを生成（CloudFront経由）
 */
export const getVideoPlaybackUrl = (
  key: string,
  format: "hls" | "mp4" = "hls"
): string | null => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  const formattedKey = format === "hls" ? `${key}/index.m3u8` : key;
  const fullUrl = `https://${CLOUDFRONT_DOMAIN}/${formattedKey}`;
  console.log("✅ 再生URL生成:", fullUrl);
  return fullUrl;
};

/**
 * 現在ログイン中のユーザーが VIP12 かどうかを判定
 */
export const isVipUser = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const vipStatus = (await getUserVipStatus(user.uid)) as VipStatus;
  return vipStatus.rank === "VIP12";
};

/**
 * 指定された videoId の動画を購入済みかどうか判定
 */
export const hasPurchasedVideo = async (
  videoId: string
): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "purchases", `${user.uid}_${videoId}`));
  return snap.exists();
};

/**
 * 新規アップロード動画を Firestore に登録
 */
export const registerUploadedVideo = async ({
  title,
  key,
  fileType,
  category = "その他",
  tags = [],
}: RegisterVideoParams): Promise<DocumentReference> => {
  const user = auth.currentUser;
  if (!user) throw new Error("ログインが必要です");

  const videosRef = collection(db, "videos");
  const newDoc = await addDoc(videosRef, {
    title,
    key,
    fileType,
    category,
    tags,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: "public",
  });

  return newDoc;
};

/**
 * 動画変換後の出力パス（例: HLS）を Firestore に保存（/index.m3u8を含むCloudFront URL形式）
 */
export const saveConvertedVideoUrl = async (
  videoId: string,
  outputPath: string
): Promise<void> => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
  const playbackUrl = `https://${CLOUDFRONT_DOMAIN}/${outputPath}/index.m3u8`;

  await updateDoc(doc(db, "videos", videoId), {
    playbackUrl,
    status: "converted",
  });
};





