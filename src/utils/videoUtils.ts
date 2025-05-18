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
 * 例：IMG_8552.MOV → https://xxxxx.cloudfront.net/converted-IMG_8552/IMG_8552_hls720.m3u8
 */
export const getVideoPlaybackUrl = (
  key: string,
  format: "hls" | "mp4" = "hls"
): string | null => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  if (format === "hls") {
    const baseKey = key.replace(/\.\w+$/, ""); // 拡張子除去 → IMG_8552
    const m3u8File = `${baseKey}_hls720.m3u8`; // ← MediaConvertの出力と一致
    const path = `converted-${baseKey}/${m3u8File}`;
    const fullUrl = `https://${CLOUDFRONT_DOMAIN}/${path}`;
    console.log("✅ 正常な再生URL:", fullUrl);
    return fullUrl;
  }

  // mp4など別形式
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
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
 * 動画変換後の出力パス（例: HLS）を Firestore に保存
 * 例: "converted-IMG_8552/IMG_8552_hls720.m3u8"
 */
export const saveConvertedVideoUrl = async (
  videoId: string,
  outputPath: string
): Promise<void> => {
  const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
  const playbackUrl = `https://${CLOUDFRONT_DOMAIN}/${outputPath}`;

  await updateDoc(doc(db, "videos", videoId), {
    playbackUrl,
    status: "converted",
  });
};
