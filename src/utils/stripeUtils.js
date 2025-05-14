import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// ✅ Cloudflare Worker経由で1ヶ月無料サブスク（クーポン付）を開始
export const createFreeSubscription = async (userId, userEmail) => {
  const stripe = await stripePromise;

  try {
    const res = await fetch("https://<your-worker>.workers.dev/create-free-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userEmail,
        coupon: "GACHA_FREE_1M", // Stripe Dashboardで作成したクーポンID
      }),
    });

    const { sessionId, error } = await res.json();

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

// ✅ Firestoreにサブスク情報を記録
export const saveUserSubscription = async (userId, subscriptionData) => {
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
