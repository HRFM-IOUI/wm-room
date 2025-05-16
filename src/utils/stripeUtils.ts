import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Stripe 初期化
const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY as string
);

/**
 * ✅ Cloudflare Worker経由で1ヶ月無料サブスク（クーポン付）を開始
 * @param userId Firebase Auth の UID
 * @param userEmail メールアドレス（Stripe customer に必要）
 */
export const createFreeSubscription = async (
  userId: string,
  userEmail: string
): Promise<void> => {
  const stripe = await stripePromise;
  if (!stripe) {
    alert("Stripeの初期化に失敗しました");
    return;
  }

  try {
    const res = await fetch(
      "https://<your-worker>.workers.dev/create-free-subscription",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userEmail,
          coupon: "GACHA_FREE_1M", // Stripeダッシュボードで作成したクーポンID
        }),
      }
    );

    const { sessionId, error }: { sessionId?: string; error?: string } = await res.json();

    if (!res.ok || !sessionId) {
      throw new Error(error || "セッション生成に失敗しました");
    }

    const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
    if (redirectError) {
      console.error("Stripeリダイレクトエラー:", redirectError.message);
      alert("リダイレクトに失敗しました。もう一度お試しください。");
    }
  } catch (err) {
    console.error("Stripeサブスク開始エラー:", err);
    alert("サブスク開始に失敗しました。ネットワーク状態をご確認ください。");
  }
};

/**
 * ✅ Firestore にサブスク情報を保存
 * @param userId Firebase UID
 * @param subscriptionData 任意の追加データ（status, plan など）
 */
export const saveUserSubscription = async (
  userId: string,
  subscriptionData: Record<string, any>
): Promise<void> => {
  try {
    await setDoc(doc(db, "subscriptions", userId), {
      ...subscriptionData,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ サブスク情報をFirestoreに保存しました");
  } catch (err) {
    console.error("Firestore保存エラー:", err);
  }
};
