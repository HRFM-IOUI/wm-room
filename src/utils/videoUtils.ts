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

// ✅ CloudFront署名はCloudflare Worker経由で取得する構成に変更
const SIGNED_URL_ENDPOINT =
  "https://cf-worker-upload.ik39-10vevic.workers.dev/signed-url";

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
 * CloudFront署名付き再生URLを取得（Worker経由）
 */
export const getVideoPlaybackUrl = async (
  key: string,
  format: "hls" | "mp4" = "hls"
): Promise<string> => {
  if (!key) throw new Error("video key が未指定です");

  const parts = key.split("/"); // videos/{videoId}/{filename}
  if (parts.length < 3) throw new Error("不正な動画キー形式");

  const videoId = parts[1];
  const fileName = parts[2].split(".")[0]; // "IMG_8552.MOV" → "IMG_8552"

  const path =
    format === "hls"
      ? `converted/${videoId}/${fileName}/playlist.m3u8`
      : key;

  const res = await fetch(SIGNED_URL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`署名付きURLの取得に失敗しました: ${text}`);
  }

  const { signedUrl } = await res.json();
  return signedUrl;
};

/**
 * VIPユーザー判定
 */
export const isVipUser = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  const vipStatus = (await getUserVipStatus(user.uid)) as VipStatus;
  return vipStatus.rank === "VIP12";
};

/**
 * 購入済み判定
 */
export const hasPurchasedVideo = async (videoId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "purchases", `${user.uid}_${videoId}`));
  return snap.exists();
};

/**
 * Firestoreへ動画を登録
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
