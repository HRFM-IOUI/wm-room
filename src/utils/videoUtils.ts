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
  if (!key || typeof key !== "string") {
    console.warn("⚠️ video key が未定義または不正:", key);
    throw new Error("video key が未指定、または形式不正です");
  }

  // 例: videos/7d8fdc42-c447-46a9-a525-22da13958354/IMG_8552.MOV
  const parts = key.split("/");
  if (parts.length < 3 || !parts[1] || !parts[2]) {
    throw new Error(`不正な動画キー形式: ${key}`);
  }

  const videoId = parts[1];
  const filePart = parts[2]; // 例: IMG_8552.MOV
  const fileBaseName = filePart.replace(/\.[^/.]+$/, ""); // 拡張子除去 → IMG_8552
  const playlistFileName = `${fileBaseName}playlist.m3u8`;

  // 例: converted/7d8fdc42-c447-46a9-a525-22da13958354/IMG_8552/IMG_8552playlist.m3u8
  const path =
    format === "hls"
      ? `converted/${videoId}/${fileBaseName}/${playlistFileName}`
      : key;

  try {
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

    if (!signedUrl) {
      throw new Error("署名URLが空です。Workerのレスポンスを確認してください。");
    }

    return signedUrl;
  } catch (err: any) {
    console.error("🔥 Worker署名URL取得エラー:", err);
    throw err;
  }
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
