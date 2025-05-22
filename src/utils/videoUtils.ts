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

// 環境変数取得（安全に）
const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN;
const CLOUDFRONT_KEY_PAIR_ID = process.env.REACT_APP_CLOUDFRONT_KEY_PAIR_ID;
const CLOUDFRONT_PRIVATE_KEY_RAW = process.env.REACT_APP_CLOUDFRONT_PRIVATE_KEY;

if (!CLOUDFRONT_DOMAIN || !CLOUDFRONT_KEY_PAIR_ID || !CLOUDFRONT_PRIVATE_KEY_RAW) {
  console.error("❌ CloudFront 関連の環境変数が不足しています。");
  throw new Error("CloudFront 環境変数が未定義です。");
}

const CLOUDFRONT_PRIVATE_KEY = CLOUDFRONT_PRIVATE_KEY_RAW.replace(/\\n/g, "\n");

/**
 * CloudFront署名付き再生URLを生成（HLS or MP4）
 */
export const getVideoPlaybackUrl = async (
  key: string,
  format: "hls" | "mp4" = "hls",
  expiresInSec = 3600
): Promise<string | null> => {
  if (!key) return null;

  const parts = key.split("/"); // ["videos", "{videoId}", "{fileName}"]
  if (parts.length < 3) return null;

  const videoId = parts[1];
  const fileNameWithExt = parts[2];
  const fileBaseName = fileNameWithExt.split(".")[0];

  const path =
    format === "hls"
      ? `/converted/videos/${videoId}/${fileBaseName}/playlist.m3u8`
      : `/${key}`;

  const url = `https://${CLOUDFRONT_DOMAIN}${path}`;

  const signedUrl = await getSignedUrl({
    url,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + expiresInSec * 1000),
  });

  return signedUrl;
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
