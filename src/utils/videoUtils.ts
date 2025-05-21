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

// .env から CloudFront署名設定を取得（\nの復元含む）
const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_DOMAIN!;
const CLOUDFRONT_KEY_PAIR_ID = process.env.REACT_APP_CLOUDFRONT_KEY_PAIR_ID!;
const CLOUDFRONT_PRIVATE_KEY = process.env.REACT_APP_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, '\n');

/**
 * CloudFront署名付き再生URLを生成（HLSまたはMP4）
 * @param key Firestoreに保存された video.key（例: videos/{videoId}/IMG_8552.MOV）
 * @param format "hls" | "mp4"
 * @param expiresInSec 有効期限（秒）
 */
export const getVideoPlaybackUrl = (
  key: string,
  format: "hls" | "mp4" = "hls",
  expiresInSec = 3600
): string | null => {
  if (!CLOUDFRONT_DOMAIN || !key) return null;

  // 例: videos/abc123/IMG_8552.MOV → basename: IMG_8552
  const fileName = key.split("/").pop()?.split(".")[0]; // IMG_8552
  const basePath = key.replace(/\.\w+$/, ""); // videos/abc123/IMG_8552

  const path =
    format === "hls"
      ? `/converted/${basePath}/${fileName}_hls.m3u8`
      : `/${key}`;

  const url = `https://${CLOUDFRONT_DOMAIN}${path}`;

  return getSignedUrl({
    url,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + expiresInSec * 1000),
  });
};

/**
 * 現在のログインユーザーが VIP12 かを判定
 */
export const isVipUser = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const vipStatus = (await getUserVipStatus(user.uid)) as VipStatus;
  return vipStatus.rank === "VIP12";
};

/**
 * ユーザーが指定された動画を購入済みかどうかを判定
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
 * Firestore に新しい動画ドキュメントを登録
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
