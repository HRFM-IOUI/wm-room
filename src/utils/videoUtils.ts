// 差し替え後の完全版 videoUtils.ts
import { auth, db } from "../firebase";
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
  DocumentReference,
} from "firebase/firestore";
import { getUserVipStatus } from "./vipUtils";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

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

// CloudFront署名設定
const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
const CLOUDFRONT_KEY_PAIR_ID = process.env.REACT_APP_CLOUDFRONT_KEY_PAIR_ID!;
const CLOUDFRONT_PRIVATE_KEY = process.env.REACT_APP_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

/**
 * CloudFront署名付き再生URLを生成（HLS or MP4）
 * 例: videos/abc123/IMG_8552.MOV → /converted/videos/abc123/IMG_8552_hls.m3u8
 */
export const getVideoPlaybackUrl = (
  key: string,
  format: "hls" | "mp4" = "hls",
  expiresInSec = 3600
): string | null => {
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  const parts = key.split("/");
  const fileNameWithExt = parts.pop() || "";
  const fileBaseName = fileNameWithExt.split(".")[0];
  const videoId = parts[1]; // videos/{videoId}/{fileName} の想定

  const path =
    format === "hls"
      ? `/converted/videos/${videoId}/${fileBaseName}_hls.m3u8`
      : `/${key}`;

  const url = `https://${CLOUDFRONT_DOMAIN}${path}`;

  return getSignedUrl({
    url,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + expiresInSec * 1000),
  });
};

export const isVipUser = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  const vipStatus = (await getUserVipStatus(user.uid)) as VipStatus;
  return vipStatus.rank === "VIP12";
};

export const hasPurchasedVideo = async (videoId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "purchases", `${user.uid}_${videoId}`));
  return snap.exists();
};

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
  return await addDoc(videosRef, {
    title,
    key,
    fileType,
    category,
    tags,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: "public",
  });
};
